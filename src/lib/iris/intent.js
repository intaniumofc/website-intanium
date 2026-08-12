import { GEMINI_MODEL_NAME } from './config.js';

/**
 * Intent Layer 1 (Regex/Keywords/Slang & Date Normalization) + Layer 2 (Gemini Flash JSON Mode)
 */

// Stop words & filler words in conversational Indonesian
const STOP_WORDS_REGEX = /\b(berikan|kirim|tolong|ada|berapa|pada|bulan|sih|dong|ya|gak|ga|bisa|kasih|apa|saja|sudah|yang|di|ke|dari|untuk|oleh|dengan|ini|itu|kah|nih|dulu|banget|seh|donk|mohon|list)\b/gi;

// Common typo & slang normalization mapping
const SLANG_MAP = {
  'thetaer': 'teater',
  'theatre': 'teater',
  'theater': 'teater',
  'teaterr': 'teater',
  'brapa': 'berapa',
  'kpn': 'kapan',
  'dmana': 'dimana',
  'showw': 'show',
  'sow': 'show',
  'jln': 'jalan',
  'thn': 'tahun',
  'bln': 'bulan',
  'tgl': 'tanggal',
  'sm': 'sama',
  'yg': 'yang',
  'tdk': 'tidak',
  'gk': 'tidak',
};

const MONTH_MAP = {
  januari: '01', jan: '01',
  februari: '02', feb: '02',
  maret: '03', mar: '03',
  april: '04', apr: '04',
  mei: '05',
  juni: '06', jun: '06',
  juli: '07', jul: '07',
  agustus: '08', agu: '08', ags: '08',
  september: '09', sep: '09',
  oktober: '10', okt: '10',
  november: '11', nov: '11',
  desember: '12', des: '12',
};

/**
 * Extract Year & Month Date Range Boundaries (e.g. "juli 2026" -> 2026-07-01 to 2026-07-31)
 */
export function extractDateFilters(query) {
  if (typeof query !== 'string') return null;
  const lower = query.toLowerCase();

  const yearMatch = lower.match(/\b(202[4-9])\b/);
  const year = yearMatch ? yearMatch[1] : '2026';

  let monthNum = null;
  Object.entries(MONTH_MAP).forEach(([monthName, num]) => {
    const reg = new RegExp(`\\b${monthName}\\b`, 'i');
    if (reg.test(lower)) {
      monthNum = num;
    }
  });

  if (monthNum) {
    const y = parseInt(year, 10);
    const m = parseInt(monthNum, 10);
    const lastDay = new Date(y, m, 0).getDate();
    const lastDayStr = String(lastDay).padStart(2, '0');

    const startDate = `${year}-${monthNum}-01T00:00:00Z`;
    const endDate = `${year}-${monthNum}-${lastDayStr}T23:59:59Z`;
    const perfStartDate = `${year}-${monthNum}-01`;
    const perfEndDate = `${year}-${monthNum}-${lastDayStr}`;

    return { year, monthNum, startDate, endDate, perfStartDate, perfEndDate, isoPattern: `${year}-${monthNum}` };
  } else if (yearMatch) {
    const startDate = `${year}-01-01T00:00:00Z`;
    const endDate = `${year}-12-31T23:59:59Z`;
    const perfStartDate = `${year}-01-01`;
    const perfEndDate = `${year}-12-31`;
    return { year, monthNum: null, startDate, endDate, perfStartDate, perfEndDate, isoPattern: `${year}` };
  }

  return null;
}

/**
 * Normalize slang & extract key search terms from casual conversational input
 */
export function normalizeQuery(query) {
  if (typeof query !== 'string') return '';
  let text = query.toLowerCase().trim();

  // Normalize slang words & typos
  Object.entries(SLANG_MAP).forEach(([slang, norm]) => {
    const reg = new RegExp(`\\b${slang}\\b`, 'gi');
    text = text.replace(reg, norm);
  });

  // Remove punctuation except alphanumeric and spaces
  const clean = text.replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  return clean;
}

/**
 * Extract clean search keywords by removing Indonesian stop words
 */
export function extractKeyTerms(query) {
  const normalized = normalizeQuery(query);
  const withoutStopWords = normalized.replace(STOP_WORDS_REGEX, '').replace(/\s+/g, ' ').trim();
  return withoutStopWords || normalized;
}

const INTENT_PATTERNS = [
  {
    intent: 'SEARCH_STATS',
    pattern: /(berapa|total|banyak|jumlah)\s*(total|banyak)?\s*(show|event|penampilan|kota|provinsi|juara|prestasi)|sudah\s*(ada)?\s*berapa\s*(show|event|penampilan)?/i,
  },
  {
    intent: 'SHOW_CITY_MAP',
    pattern: /(tampilkan|lihat|buka|zoom|cari|ada apa di|peta|lokasi)\s+(di|kota)?\s*([a-zA-Z\s]+)/i,
    extract: (m) => ({ city: m[3]?.trim() }),
  },
  {
    intent: 'NAVIGATE_PAGE',
    pattern: /(buka|pergi ke|pindah ke|halaman|lihat)\s+(galeri|peta|jadwal|tentang intan|tentang iris|tentang|timeline|milestone|berita|home|beranda|denger intan|musik|playlist|esport|game|kecoa|gosok|fanart|mading|toko|merchandise|merch|photobooth|recap|rekap|join|daftar)/i,
    extract: (m) => {
      const page = (m[2] || '').toLowerCase();
      let path = '/';
      if (page.includes('galeri')) path = '/gallery';
      else if (page.includes('peta')) path = '/peta-penampilan';
      else if (page.includes('jadwal')) path = '/schedule';
      else if (page.includes('tentang intan')) path = '/about-intan';
      else if (page.includes('tentang iris')) path = '/about-iris';
      else if (page.includes('tentang')) path = '/about-intan';
      else if (page.includes('timeline') || page.includes('milestone')) path = '/milestone';
      else if (page.includes('berita')) path = '/news';
      else if (page.includes('denger') || page.includes('musik') || page.includes('playlist')) path = '/denger-intan';
      else if (page.includes('esport')) path = '/esport';
      else if (page.includes('kecoa')) path = '/games/menangkap-kecoa';
      else if (page.includes('gosok')) path = '/games/gosok-intan';
      else if (page.includes('game')) path = '/games';
      else if (page.includes('fanart')) path = '/fanart';
      else if (page.includes('mading')) path = '/mading';
      else if (page.includes('toko') || page.includes('merchandise') || page.includes('merch')) path = '/merchandise';
      else if (page.includes('photobooth')) path = '/photobooth';
      else if (page.includes('recap') || page.includes('rekap')) path = '/recaps';
      else if (page.includes('join') || page.includes('daftar')) path = '/join';
      return { path };
    },
  },
  {
    intent: 'SEARCH_MERCHANDISE',
    pattern: /(merchandise|merch|toko|kaos|t-shirt|photocard|lanyard|keychain|gantungan kunci|stiker|harga|beli|pesanan|invoice)/i,
    extract: () => ({ path: '/merchandise' }),
  },
  {
    intent: 'SEARCH_GAMES',
    pattern: /(game|permainan|kecoa|gosok intan|gacha|clicker|leaderboard|skor)/i,
    extract: (m) => {
      const q = m[0].toLowerCase();
      if (q.includes('kecoa')) return { path: '/games/menangkap-kecoa' };
      if (q.includes('gosok')) return { path: '/games/gosok-intan' };
      return { path: '/games' };
    },
  },
  {
    intent: 'SEARCH_ESPORT',
    pattern: /(esport|e-sport|mobile legends|mlbb|pubg|roster|turnamen|klasemen|match)/i,
    extract: () => ({ path: '/esport' }),
  },
  {
    intent: 'SEARCH_FANART',
    pattern: /(fanart|fan art|lukisan|gambar|karya seni|ilustrasi)/i,
    extract: () => ({ path: '/fanart' }),
  },
  {
    intent: 'SEARCH_PLAYLIST',
    pattern: /(playlist|denger intan|dengerintan|lagu|spotify|voice note|podcast|cover lagu)/i,
    extract: () => ({ path: '/denger-intan' }),
  },
  {
    intent: 'SEARCH_RECAP',
    pattern: /(recap|rekap|ringkasan show|mc highlight|majalah recap)/i,
    extract: () => ({ path: '/recaps' }),
  },
  {
    intent: 'SEARCH_JOIN',
    pattern: /(join|gabung|daftar|keanggotaan|member|admin|volunteer|relawan)/i,
    extract: () => ({ path: '/join' }),
  },
  {
    intent: 'FAQ_BIRTHDAY',
    pattern: /(kapan|tanggal|berapa)\s+(ulang tahun|ultah|lahir|birth)/i,
  },
  {
    intent: 'FAQ_SILAT',
    pattern: /(pencak silat|silat|juara|prestasi silat|tapak suci)/i,
  },
  {
    intent: 'SEARCH_EVENT',
    pattern: /(event|penampilan|konser|show|teater|onair|offair|juli|agustus|september|oktober|november|desember|januari|februari|maret|april|mei|juni)/i,
  },
];

export async function detectIntent(userQuestion, apiKey = null) {
  const cleanQ = userQuestion.trim();
  const normalizedQ = normalizeQuery(cleanQ);
  const keyTerms = extractKeyTerms(cleanQ);
  const dateFilter = extractDateFilters(cleanQ);

  // Layer 1: Fast Regex Matching on Normalized Query
  for (const item of INTENT_PATTERNS) {
    const match = normalizedQ.match(item.pattern) || cleanQ.match(item.pattern);
    if (match) {
      const extracted = item.extract ? item.extract(match) : {};

      let action = null;
      if (item.intent === 'SHOW_CITY_MAP' && extracted.city) {
        action = { name: 'zoomMap', city: extracted.city };
      } else if ((item.intent === 'NAVIGATE_PAGE' || extracted.path) && extracted.path) {
        action = { name: 'navigate', path: extracted.path };
      }

      return {
        intent: item.intent,
        confidence: 0.95,
        entities: extracted,
        keyword: keyTerms,
        dateFilter,
        action,
        layer: 1,
      };
    }
  }

  // Layer 2: Gemini Flash Structured JSON Fallback
  if (apiKey) {
    try {
      const promptText = `Klasifikasikan pertanyaan berikut ke salah satu intent (SEARCH_STATS, SHOW_CITY_MAP, NAVIGATE_PAGE, SEARCH_EVENT, SEARCH_MERCHANDISE, SEARCH_GAMES, SEARCH_ESPORT, SEARCH_FANART, SEARCH_PLAYLIST, SEARCH_RECAP, SEARCH_JOIN, FAQ_GENERAL) dan buat action jika relevan.
Format JSON persis:
{
  "intent": "nama_intent",
  "confidence": 0.85,
  "key_terms": "kata_kunci_pencarian_tanpa_kata_basa_basi",
  "action": null | {"name": "zoomMap", "city": "Surabaya"} | {"name": "navigate", "path": "/merchandise"}
}

Pertanyaan: "${cleanQ}"`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return {
            intent: parsed.intent || 'GENERAL_QUERY',
            confidence: parsed.confidence || 0.8,
            keyword: parsed.key_terms || keyTerms,
            dateFilter,
            action: parsed.action || null,
            layer: 2,
          };
        }
      }
    } catch (err) {
      console.warn('Intent Layer 2 error, fallback to Layer 1 default:', err.message);
    }
  }

  return {
    intent: 'GENERAL_QUERY',
    confidence: 0.5,
    keyword: keyTerms,
    dateFilter,
    action: null,
    layer: 1,
  };
}
