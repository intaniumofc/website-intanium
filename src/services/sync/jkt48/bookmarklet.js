// Client-safe (no server-only): builds the `javascript:` bookmarklet that runs
// on the jkt48.com page. Because jkt48.com blocks our SERVER (Cloudflare 403)
// but not a real logged-in browser, the browser does the fetching same-origin
// and posts the results back to our token-protected import endpoint.

export const DEBUT = { year: 2024, month: 12 };
export const MONTHS_FORWARD = 2;

/**
 * The routine executed on the jkt48.com page. Must be fully self-contained
 * (no closure over module scope) because it is serialized via toString().
 * All configuration arrives through the CFG argument.
 */
async function importRoutine(CFG) {
  const log = (m) => { try { console.log('[intan-import]', m); } catch { /* noop */ } };
  const notify = (m) => {
    try {
      let el = document.getElementById('intan-import-hud');
      if (!el) {
        el = document.createElement('div');
        el.id = 'intan-import-hud';
        el.style.cssText = 'position:fixed;z-index:2147483647;right:16px;bottom:16px;max-width:340px;padding:12px 16px;background:#FF5FB2;color:#fff;font:13px/1.4 -apple-system,Segoe UI,sans-serif;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35)';
        document.body.appendChild(el);
      }
      el.textContent = m;
    } catch { /* noop */ }
  };

  try {
    notify('Menyiapkan sinkronisasi Intan…');

    // 1. Build month range: debut -> current month + forward
    const now = new Date();
    const months = [];
    let y = CFG.debut.year, m = CFG.debut.month;
    const endTotal = now.getFullYear() * 12 + now.getMonth() + CFG.forward;
    let guard = 0;
    while (y * 12 + (m - 1) <= endTotal && guard < 130) {
      months.push({ y: y, m: m }); m++; if (m > 12) { m = 1; y++; } guard++;
    }

    // 2. Ask our server which past links are already resolved (skip their detail)
    const resolved = new Set();
    try {
      const rr = await fetch(CFG.apiBase + '/api/admin/schedule/import?action=resolved&token=' + encodeURIComponent(CFG.token));
      if (rr.ok) { const jj = await rr.json(); (jj.resolvedLinks || []).forEach((l) => resolved.add(String(l))); }
    } catch (e) { log('resolved fetch failed: ' + e); }

    // 3. Fetch schedule lists for every month (same-origin -> passes Cloudflare)
    const rawItems = [];
    for (const mo of months) {
      const mm = ('0' + mo.m).slice(-2);
      notify('Ambil jadwal ' + mm + '/' + mo.y + '…');
      try {
        const r = await fetch('/api/v1/schedules?lang=id&month=' + mm + '&year=' + mo.y, { headers: { accept: 'application/json' } });
        if (!r.ok) continue;
        const j = await r.json();
        if (j && j.status && Array.isArray(j.data)) rawItems.push.apply(rawItems, j.data);
      } catch (e) { log('list fail ' + mm + '/' + mo.y + ': ' + e); }
    }

    // 4. Dedupe by link
    const seen = new Set(); const list = [];
    for (const it of rawItems) {
      const link = String(it.link || it.id || it.slug || '');
      if (!link || seen.has(link)) continue;
      seen.add(link); list.push(it);
    }
    if (!list.length) {
      notify('Tidak ada jadwal ditemukan. Pastikan halaman jkt48.com terbuka & sudah lolos verifikasi.');
      return;
    }

    // 5. Fetch detail per item (skip past+resolved), limited concurrency
    const entries = [];
    let idx = 0, doneCount = 0;
    async function fetchDetail(code, type) {
      const c = encodeURIComponent(code);
      const th = '/api/v1/theater-shows/' + c + '?lang=id';
      const ev = '/api/v1/events/' + c + '?lang=id';
      const sc = '/api/v1/schedules/' + c + '?lang=id';
      const urls = (type && type !== 'SHOW') ? [ev, sc, th] : [th, ev, sc];
      for (const u of urls) {
        try {
          const r = await fetch(u, { headers: { accept: 'application/json' } });
          if (!r.ok) continue;
          const j = await r.json();
          const d = (j && j.data) ? j.data : j;
          if (d && typeof d === 'object' && Object.keys(d).length) return d;
        } catch { /* try next */ }
      }
      return null;
    }
    async function worker() {
      while (idx < list.length) {
        const it = list[idx++];
        const link = String(it.link || it.id || it.slug);
        if (resolved.has(link)) {
          entries.push({ list: it, detail: null, skippedDetail: true });
        } else {
          const d = await fetchDetail(link, it.type);
          entries.push({ list: it, detail: d });
        }
        doneCount++;
        if (doneCount % 5 === 0 || doneCount === list.length) notify('Memproses detail ' + doneCount + '/' + list.length + '…');
      }
    }
    const workers = []; for (let i = 0; i < 6; i++) workers.push(worker());
    await Promise.all(workers);

    // 6. Send to our server in chunks (cross-origin, token-authenticated)
    const CHUNK = 80;
    const agg = { total: 0, processed: 0, matched: 0, upserted: 0, skipped: 0, failed: 0, fromCache: 0 };
    for (let i = 0; i < entries.length; i += CHUNK) {
      const part = entries.slice(i, i + CHUNK);
      notify('Mengirim ke server ' + Math.min(i + CHUNK, entries.length) + '/' + entries.length + '…');
      const res = await fetch(CFG.apiBase + '/api/admin/schedule/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: CFG.token, entries: part, onlyIntan: true }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.success) {
        notify('Gagal: ' + (out.error || ('HTTP ' + res.status)));
        return;
      }
      const s = out.summary || {};
      for (const k in agg) agg[k] += (s[k] || 0);
    }
    notify('Selesai ✓ ' + agg.upserted + ' disimpan, ' + agg.fromCache + ' dari cache, ' + agg.failed + ' gagal. Cek panel admin (status draft).');
  } catch (e) {
    notify('Error: ' + (e && e.message ? e.message : e));
  }
}

/**
 * Build the `javascript:` bookmarklet string with config baked in.
 * @param {{ apiBase: string, token: string }} opts
 */
export function buildBookmarklet({ apiBase, token }) {
  const cfg = JSON.stringify({ apiBase, token, debut: DEBUT, forward: MONTHS_FORWARD });
  const body = `(${importRoutine.toString()})(${cfg});void 0;`;
  return 'javascript:' + encodeURIComponent(body);
}
