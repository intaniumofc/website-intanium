import { JKT48_SCHEDULE_LIST_URL, JKT48_FETCH_HEADERS, INTAN_ALIASES } from './config.js';

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

export async function fetchScheduleList() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const url = `https://jkt48.com/api/v1/schedules?lang=id&month=${month}&year=${year}`;
  const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
  
  if (!res.ok) {
    throw new Error(`Gagal memuat jadwal dari API JKT48 (status ${res.status})`);
  }

  const json = await res.json().catch(() => null);
  if (!json || !json.status || !Array.isArray(json.data)) {
    throw new Error('Format respon API JKT48 tidak valid atau data kosong.');
  }

  // Normalize each item to match details parsing requirements
  const normalized = json.data.map(item => {
    if (!item.link) return null;
    let platform = 'Show Theater';
    if (item.type !== 'SHOW') {
      platform = item.type || 'Other Events';
    }
    return {
      link: item.link,
      title: item.title || '(Tanpa Judul)',
      timeIso: parseJakartaDateTime(item.date, item.start_time),
      platform,
      raw: item
    };
  }).filter(Boolean);

  return normalized;
}

export async function fetchScheduleDetail(link) {
  const url = `https://jkt48.com/api/v1/schedules/${encodeURIComponent(link)}`;
  const res = await fetchWithTimeout(url, { headers: { accept: 'application/json' } });
  if (!res.ok) {
    return null;
  }
  const json = await res.json().catch(() => null);
  return json?.status ? json.data : null;
}

function isIntanInText(value) {
  if (!value || typeof value !== 'string') return false;
  const v = value.toLowerCase();
  return INTAN_ALIASES.some((alias) => v.includes(alias));
}

export function filterIntan(detail) {
  if (!detail) return false;
  const members = detail.jkt48_member || detail.members || detail.lineup || [];
  if (Array.isArray(members) && members.some((m) => isIntanInText(m.name || m.nickname || m.fullname || ''))) {
    return true;
  }
  if (members && typeof members === 'object') {
    return Object.values(members).some((m) => isIntanInText(m.name || m.nickname || m.fullname || ''));
  }
  if (isIntanInText(detail.birthday_member_name)) return true;
  return false;
}

function getSetlistThumbnail(detail, item) {
  const defaultImage = detail.thumbnail || detail.image_url || item.raw?.thumbnail || '';
  if (defaultImage && defaultImage.startsWith('http')) {
    return defaultImage;
  }

  const title = (detail.title || item.title || '').toLowerCase();
  const setlistCode = (detail.set_list || '').toLowerCase();

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

export async function fetchIntanSchedulesFromJKT48() {
  const list = await fetchScheduleList();
  const matched = [];
  const skipped = [];
  for (const item of list) {
    const detail = await fetchScheduleDetail(item.link);
    if (!detail) {
      skipped.push({ link: item.link, reason: 'detail not available' });
      continue;
    }
    if (!filterIntan(detail)) {
      skipped.push({ link: item.link, reason: 'no intan' });
      continue;
    }
    let timeIso = item.timeIso;
    if (detail.date) {
      const parsed = parseJakartaDateTime(detail.date, detail.start_time);
      if (parsed) timeIso = parsed;
    }

    matched.push({
      link: item.link,
      title: detail.title || item.title,
      description: detail.description || detail.summary || '',
      time: timeIso,
      platform: item.platform,
      link_url: `https://jkt48.com/schedule/${item.link}`,
      duration: detail.duration ? String(detail.duration) : '2 Jam',
      thumbnail: getSetlistThumbnail(detail, item),
      raw: detail,
    });
  }
  return { matched, skipped, total: list.length };
}
