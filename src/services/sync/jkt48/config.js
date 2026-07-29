// Base URL for the JKT48 data source. Configurable via env so a
// server-side-accessible proxy/mirror can be swapped in without code changes
// (jkt48.com itself is currently behind Cloudflare and returns 403 to servers).
export const JKT48_API_BASE = process.env.JKT48_API_BASE || 'https://jkt48.com';

export const JKT48_BASE_URL = 'https://jkt48.com';
export const JKT48_SCHEDULE_LIST_URL = `${JKT48_API_BASE}/schedule/list?lang=id`;
export const INTAN_ALIASES = ['nur intan', 'intan', 'gen 13', 'generasi 13', 'gen-13'];

// Default "Sync Penuh" range: from Intan's debut (Gen 13, Dec 2024) forward to
// a couple of months ahead of the current month. Overridable per-request.
export const DEBUT_YEAR = 2024;
export const DEBUT_MONTH = 12;
export const DEFAULT_MONTHS_FORWARD = 2;

export const JKT48_FETCH_HEADERS = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.8,*/*;q=0.7',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'cache-control': 'no-cache',
  pragma: 'no-cache',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
};
