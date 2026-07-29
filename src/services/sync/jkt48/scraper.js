import {
  JKT48_API_BASE,
  JKT48_SCHEDULE_LIST_URL,
  JKT48_FETCH_HEADERS,
  INTAN_ALIASES,
  DEBUT_YEAR,
  DEBUT_MONTH,
  DEFAULT_MONTHS_FORWARD,
} from './config.js';

const REQUEST_TIMEOUT_MS = 12_000;

async function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal, headers: { ...JKT48_FETCH_HEADERS, ...(opts.headers || {}) } });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractNuxtState(html) {
  const matches = [...html.matchAll(/<script[^>]*data-nuxt-data[^>]*>([\s\S]*?)<\/script>/gi)];
  if (!matches.length) return null;
  const raw = matches[0][1].trim();
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function deepFindScheduleItems(obj) {
  if (!obj || typeof obj !== 'object') return [];
  if (Array.isArray(obj)) {
    let out = [];
    for (const it of obj) {
      if (it && typeof it === 'object' && ('link' in it || 'title' in it) && ('start' in it || 'date' in it || 'time' in it)) {
        out.push(it);
      }
      out = out.concat(deepFindScheduleItems(it));
    }
    return out;
  }
  let out = [];
  for (const key of Object.keys(obj)) {
    if (key === 'other-schedules' && Array.isArray(obj[key])) {
      out = out.concat(obj[key]);
    }
    out = out.concat(deepFindScheduleItems(obj[key]));
  }
  return out;
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') return null;
  const link = item.link || item.slug || item.id;
  if (!link) return null;
  const title = item.title || item.name || '(Tanpa Judul)';
  const rawTime = item.start_time || item.start || item.date || item.time || null;
  let timeIso = null;
  if (rawTime) {
    const d = new Date(rawTime);
    if (!isNaN(d.getTime())) timeIso = d.toISOString();
  }
  const platform = item.platform || item.category || item.type || 'Other Events';
  return {
    link: String(link),
    title: String(title),
    timeIso,
    platform: String(platform),
    raw: item,
  };
}

function parseJakartaDateTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const cleanTime = timeStr && timeStr.includes(':') ? timeStr : '00:00:00';
  // Jika string tanggal sudah memiliki penanda timezone (Z atau +/-), parsing apa adanya.
  // Jika tidak, asumsikan sebagai Waktu Indonesia Barat (WIB / UTC+7).
  const combined = `${dateStr}T${cleanTime}`;
  const hasTimezone = dateStr.includes('Z') || dateStr.includes('+') || (dateStr.includes('-') && dateStr.split('-').length > 3) || cleanTime.includes('Z') || cleanTime.includes('+') || cleanTime.includes('-');

  const d = hasTimezone ? new Date(combined) : new Date(`${combined}+07:00`);
  return !isNaN(d.getTime()) ? d.toISOString() : null;
}

/**
 * Build the list of {month, year} to fetch.
 * - Explicit single month/year -> just that month.
 * - fullRange -> from debut (DEBUT_YEAR/DEBUT_MONTH, overridable via
 *   fromMonth/fromYear) up to the current month + monthsForward.
 * - Otherwise -> legacy rolling window (monthsBack .. +1).
 */
function buildMonthsToFetch(options, now) {
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;

  if (options.month && options.year) {
    return [{ month: Number(options.month), year: Number(options.year) }];
  }

  if (options.fullRange) {
    const fromYear = Number(options.fromYear) || DEBUT_YEAR;
    const fromMonth = Number(options.fromMonth) || DEBUT_MONTH;
    const monthsForward = Number.isFinite(Number(options.monthsForward))
      ? Number(options.monthsForward)
      : DEFAULT_MONTHS_FORWARD;

    const months = [];
    let m = fromMonth;
    let y = fromYear;
    // End boundary: current month + monthsForward
    const endTotal = curYear * 12 + (curMonth - 1) + monthsForward;
    let curTotal = y * 12 + (m - 1);
    // Safety cap to avoid runaway loops on bad input (max ~10 years).
    let guard = 0;
    while (curTotal <= endTotal && guard < 130) {
      months.push({ month: m, year: y });
      m += 1;
      if (m > 12) { m = 1; y += 1; }
      curTotal = y * 12 + (m - 1);
      guard += 1;
    }
    return months;
  }

  // Legacy default range: last `monthsBack` months up to next month.
  const monthsBack = options.monthsBack || 18;
  const months = [];
  for (let i = -monthsBack; i <= 1; i++) {
    let m = curMonth + i;
    let y = curYear;
    while (m < 1) { m += 12; y -= 1; }
    while (m > 12) { m -= 12; y += 1; }
    months.push({ month: m, year: y });
  }
  return months;
}

/**
 * Normalize a raw item from the JKT48 `/api/v1/schedules` list endpoint into
 * our internal shape. Shared by the server-side fetch and the browser import
 * path (bookmarklet) so both classify against identical data.
 */
export function normalizeApiListItem(item) {
  if (!item || typeof item !== 'object') return null;
  const itemLink = item.link || item.id || item.slug;
  if (!itemLink) return null;
  let platform = 'Show Theater';
  if (item.type && item.type !== 'SHOW') {
    platform = item.type || 'Other Events';
  }
  return {
    link: String(itemLink),
    title: item.title || item.name || '(Tanpa Judul)',
    timeIso: parseJakartaDateTime(item.date, item.start_time),
    platform,
    raw: item,
  };
}

export async function fetchScheduleList(options = {}) {
  const now = new Date();
  const monthsToFetch = buildMonthsToFetch(options, now);

  // Fetch all months concurrently with Promise.all
  const fetchMonth = async ({ month, year }) => {
    try {
      const monthStr = String(month).padStart(2, '0');
      const urls = [
        `${JKT48_API_BASE}/api/v1/schedules?lang=id&month=${monthStr}&year=${year}`,
        `${JKT48_API_BASE}/api/v1/schedules?lang=id&month=${month}&year=${year}`,
      ];

      let monthData = [];

      for (const url of urls) {
        const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
        if (!res.ok) continue;

        const json = await res.json().catch(() => null);
        if (json && json.status && Array.isArray(json.data) && json.data.length > 0) {
          monthData = json.data;
          break;
        }
      }

      if (monthData.length > 0) {
        return monthData.map(normalizeApiListItem).filter(Boolean);
      }
      return [];
    } catch (err) {
      console.warn(`Gagal memuat jadwal JKT48 untuk ${month}/${year}:`, err?.message || err);
      return [];
    }
  };

  const monthResults = await Promise.all(monthsToFetch.map(fetchMonth));
  const allItems = monthResults.flat();

  // HTML Fallback if API returned 0 total items
  if (allItems.length === 0) {
    try {
      const res = await fetchWithTimeout(JKT48_SCHEDULE_LIST_URL);
      if (res.ok) {
        const html = await res.text();
        const nuxtData = extractNuxtState(html);
        if (nuxtData) {
          const rawItems = deepFindScheduleItems(nuxtData);
          const normalized = rawItems.map(normalizeItem).filter(Boolean);
          allItems.push(...normalized);
        }
      }
    } catch (e) {
      console.warn('HTML schedule fallback failed:', e?.message || e);
    }
  }

  // Deduplicate items by link
  const seenLinks = new Set();
  const deduplicated = allItems.filter(item => {
    if (seenLinks.has(item.link)) return false;
    seenLinks.add(item.link);
    return true;
  });

  return deduplicated;
}

const unwrapApiData = (payload) => {
  if (!payload) return null;
  return payload?.data ?? payload;
};

/**
 * Fetch schedule detail for a code.
 * `platformHint` reorders the candidate endpoints so the most likely one is
 * tried first (theater shows vs. other events).
 * Returns the detail object on success, or null if every candidate failed.
 */
export async function fetchScheduleDetail(code, platformHint = '') {
  if (!code) return null;
  const cleanCode = encodeURIComponent(String(code).trim());

  const theaterFirst = [
    `${JKT48_API_BASE}/api/v1/theater-shows/${cleanCode}?lang=id`,
    `${JKT48_API_BASE}/api/v1/events/${cleanCode}?lang=id`,
    `${JKT48_API_BASE}/api/v1/schedules/${cleanCode}?lang=id`,
  ];
  const eventsFirst = [
    `${JKT48_API_BASE}/api/v1/events/${cleanCode}?lang=id`,
    `${JKT48_API_BASE}/api/v1/schedules/${cleanCode}?lang=id`,
    `${JKT48_API_BASE}/api/v1/theater-shows/${cleanCode}?lang=id`,
  ];

  const hint = String(platformHint || '').toLowerCase();
  const isTheater = hint.includes('theater') || hint === '' || hint === 'show';
  const candidateUrls = isTheater ? theaterFirst : eventsFirst;

  for (const url of candidateUrls) {
    try {
      const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
      if (!res.ok) continue;
      const payload = await res.json().catch(() => null);
      const data = unwrapApiData(payload);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return data;
      }
    } catch {
      // try next candidate
    }
  }

  return null;
}

function isIntanInText(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.toLowerCase();
  return INTAN_ALIASES.some((alias) => v.includes(alias));
}

const scanMembers = (members, checkMember) => {
  if (Array.isArray(members) && members.some(checkMember)) return true;
  if (members && typeof members === 'object') {
    return Object.values(members).some((val) => {
      if (typeof val === 'string') return isIntanInText(val);
      if (Array.isArray(val)) return val.some(checkMember);
      return checkMember(val);
    });
  }
  return false;
};

export function filterIntan(detail, item = {}) {
  if (!detail && !item) return false;

  const itemRaw = item?.raw || item || {};
  const target = detail || itemRaw;

  // 1. Direct text check on title, description, summary, setlist, etc.
  const textContent = [
    item?.title,
    itemRaw?.title,
    detail?.title,
    detail?.description,
    detail?.summary,
    detail?.content,
    detail?.birthday_member_name,
    detail?.set_list,
  ].filter(Boolean).join(' ');

  if (isIntanInText(textContent)) return true;

  // 2. Recursive member scanner across member/lineup fields
  const checkMember = (m) => {
    if (!m) return false;
    if (typeof m === 'string') return isIntanInText(m);
    if (typeof m === 'object') {
      const nameStr = m.name || m.nickname || m.fullname || m.member_name || m.label || '';
      if (isIntanInText(nameStr)) return true;
    }
    return false;
  };

  const memberSources = [
    target.jkt48_member || target.members || target.lineup || target.performers || target.member_list,
    itemRaw.jkt48_member || itemRaw.members || itemRaw.lineup || itemRaw.performers || itemRaw.member_list,
  ];
  if (memberSources.some((m) => m && scanMembers(m, checkMember))) {
    return true;
  }

  // Strict mode: Only match if Intan / Nur Intan / Gen 13 is explicitly mentioned in lineup or text
  return false;
}

function getSetlistThumbnail(detail, item) {
  const defaultImage = detail?.thumbnail || detail?.image_url || item?.raw?.thumbnail || '';
  if (defaultImage && defaultImage.startsWith('http')) {
    return defaultImage;
  }

  const title = (detail?.title || item?.title || '').toLowerCase();
  const setlistCode = (detail?.set_list || '').toLowerCase();

  // Map Pajama Drive
  if (title.includes('pajama') || setlistCode === 'sl_27' || setlistCode.includes('pajama')) {
    return '/setlistpajamadrive.webp';
  }
  // Map Aitakatta / Ingin Bertemu
  if (title.includes('aitakatta') || title.includes('ingin bertemu')) {
    return '/setlistaitakatta.webp';
  }
  // Map Kira Kira Girls
  if (title.includes('kira kira') || title.includes('kirakira') || title.includes('tunas di balik awan')) {
    return '/setlistkirakiragirls.webp';
  }

  // Fallback to pajama drive setlist banner which represents the theater stage look nicely
  return '/setlistpajamadrive.webp';
}

function buildMatchedEntry(item, detail) {
  let timeIso = item.timeIso;
  if (detail && detail.date) {
    const parsed = parseJakartaDateTime(detail.date, detail.start_time);
    if (parsed) timeIso = parsed;
  }
  return {
    link: item.link,
    title: detail?.title || item.title,
    description: detail?.description || detail?.summary || '',
    time: timeIso,
    platform: item.platform,
    link_url: `${JKT48_API_BASE}/schedule/${item.link}`,
    duration: detail?.duration ? String(detail.duration) : '2 Jam',
    thumbnail: getSetlistThumbnail(detail || {}, item),
    raw: detail || item,
  };
}

/**
 * Classify a single (item, detail) pair. Pure — no fetching.
 * Returns { matched?, skipped?, failed?, cacheEntry }.
 */
function classifyItem(item, detail, { onlyIntan }) {
  const detailOk = detail !== null && detail !== undefined;
  const isIntan = filterIntan(detail, item);
  const cacheEntry = {
    link: item.link,
    is_intan: isIntan,
    title: item.title,
    platform: item.platform,
    event_time: item.timeIso || null,
    detail_ok: detailOk,
  };

  if (!detailOk) {
    // Couldn't confirm via detail — don't silently drop as "no intan".
    // Record as failed with detail_ok=false so the next sync retries it.
    return { failed: { link: item.link, reason: 'detail fetch failed', is_intan: isIntan }, cacheEntry };
  }
  if (onlyIntan && !isIntan) {
    return { skipped: { link: item.link, reason: 'no intan' }, cacheEntry };
  }
  return { matched: buildMatchedEntry(item, detail), cacheEntry };
}

/**
 * Fetch detail + classify a set of list items.
 * Returns { matched, skipped, failed, cacheEntries }.
 * - failed: detail fetch failed (detail_ok=false) -> retried on next sync.
 * - skipped: detail ok but no Intan (only when onlyIntan filter active).
 */
async function processItems(items, { onlyIntan }) {
  const matched = [];
  const skipped = [];
  const failed = [];
  const cacheEntries = [];

  const BATCH_SIZE = 10;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const details = await Promise.all(batch.map((item) => fetchScheduleDetail(item.link, item.platform)));

    batch.forEach((item, idx) => {
      const res = classifyItem(item, details[idx], { onlyIntan });
      if (res.matched) matched.push(res.matched);
      if (res.skipped) skipped.push(res.skipped);
      if (res.failed) failed.push(res.failed);
      cacheEntries.push(res.cacheEntry);
    });
  }

  return { matched, skipped, failed, cacheEntries };
}

/**
 * Classify schedules whose list item and detail were already fetched by the
 * browser (bookmarklet). No server-side network access to jkt48.com.
 *
 * @param {Array<{list?: object, raw?: object, detail?: object|null}>} entries
 *   Each entry: `list`/`raw` = raw item from /api/v1/schedules; `detail` =
 *   raw detail object (or null if the browser couldn't fetch it).
 */
export function classifyImportedSchedules(entries = [], { onlyIntan = true } = {}) {
  const matched = [];
  const skipped = [];
  const failed = [];
  const cacheEntries = [];

  for (const entry of entries) {
    const item = normalizeApiListItem(entry.list || entry.raw || entry);
    if (!item) continue;
    const res = classifyItem(item, entry.detail ?? null, { onlyIntan });
    if (res.matched) matched.push(res.matched);
    if (res.skipped) skipped.push(res.skipped);
    if (res.failed) failed.push(res.failed);
    cacheEntries.push(res.cacheEntry);
  }

  return { matched, skipped, failed, cacheEntries };
}

export async function fetchIntanSchedulesFromJKT48(options = {}) {
  const list = await fetchScheduleList(options);
  const onlyIntanFilter = options.onlyIntan !== false; // Default: true
  const cache = options.cache || null;

  let toProcess = list;
  let fromCache = 0;

  // Cache-aware partitioning: skip re-fetching detail for past shows that were
  // already resolved successfully (they were upserted in a prior run).
  if (cache) {
    const resolved = await cache.getResolved(list.map((i) => i.link));
    const now = Date.now();
    toProcess = [];
    for (const item of list) {
      const cached = resolved.get(item.link);
      const timeRef = item.timeIso || cached?.event_time || null;
      const isPast = timeRef ? new Date(timeRef).getTime() < now : false;
      if (cached && cached.detail_ok && isPast) {
        fromCache += 1;
        continue; // final result; already in DB
      }
      toProcess.push(item);
    }
  }

  const { matched, skipped, failed, cacheEntries } = await processItems(toProcess, { onlyIntan: onlyIntanFilter });

  if (cache && cacheEntries.length) {
    await cache.save(cacheEntries);
  }

  return { matched, skipped, failed, fromCache, total: list.length };
}

/**
 * Re-process a specific set of previously-failed schedule codes.
 * Accepts an array of codes (strings) or minimal item objects.
 * Returns { matched, skipped, failed, total }.
 */
export async function retryFailedIntanItems(codes = [], options = {}) {
  const onlyIntanFilter = options.onlyIntan !== false;
  const cache = options.cache || null;

  const items = codes.map((c) => {
    if (typeof c === 'string') {
      return { link: c, title: c, timeIso: null, platform: '', raw: {} };
    }
    return {
      link: String(c.link),
      title: c.title || String(c.link),
      timeIso: c.timeIso || c.event_time || null,
      platform: c.platform || '',
      raw: c.raw || {},
    };
  }).filter((i) => i.link);

  const { matched, skipped, failed, cacheEntries } = await processItems(items, { onlyIntan: onlyIntanFilter });

  if (cache && cacheEntries.length) {
    await cache.save(cacheEntries);
  }

  return { matched, skipped, failed, total: items.length };
}
