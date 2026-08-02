/**
 * Privacy Guard Module
 * Runs BEFORE Intent Layer 1 & Retrieval to protect sensitive personal info (PII)
 */

const PRIVACY_PATTERNS = [
  /\balamat\s*(rumah|lengkap|pribadi)\b/i,
  /\brumah(nya)?\s*di\s*(mana|daerah|wilayah|sekitar|lokasi)\b/i,
  /\brumah(nya)?\s*dimana\b/i,
  /\bno(mor)?\s*rumah\b/i,
  /\bno(mor)?\s*(hp|telepon|telp|wa|whatsapp)\b/i,
  /\bkontak\s*pribadi\b/i,
  /\bemail\s*pribadi\b/i,
  /\bdata\s*keluarga\b/i,
  /\borang\s*tua\b/i,
  /\bno(mor)?\s*ktp\b/i,
  /\bnik\s*ktp\b/i,
  /\btinggal(nya)?\s*di\s*(mana|daerah|wilayah|sekitar|lokasi)\b/i,
  /\btinggal(nya)?\s*dimana\b/i,
  /\blokasi\s*rumah\b/i,
  /\bpatokan\s*rumah\b/i,
  /\bkost(an)?\b/i,
  /\btempat\s*tinggal\s*(persis|tepatnya|pribadi)?\b/i,
];

export const PRIVACY_REFUSAL_MESSAGE =
  "Wah, itu aku nggak akan share ya — itu ranah privasi Intan 🙏 Tapi kalau mau tau soal kegiatan, event, atau prestasi Intan, gas tanya aku!";

export function checkPrivacyGuard(message) {
  if (typeof message !== 'string') return { triggered: false };
  const cleanMsg = message.trim();

  for (const pattern of PRIVACY_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      return {
        triggered: true,
        reason: `Matched pattern: ${pattern.toString()}`,
        message: PRIVACY_REFUSAL_MESSAGE,
      };
    }
  }

  return { triggered: false };
}
