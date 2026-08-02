/**
 * Smalltalk & Friendly Greetings Handler
 * Handles casual conversational greetings (e.g., "halo min", "siang min", "pagi min", "hai", "apa kabar", "makasih")
 * BEFORE executing database retrieval, ensuring natural human-like responses.
 */

const GREETING_PATTERNS = [
  /^(halo|hallo|hi|hai|hei|helo|p|permisi)\s*(min|admin|iris|bot|kak|guys|gan)?$/i,
  /^(selamat|met)?\s*(pagi|siang|sore|malam)\s*(min|admin|iris|kak)?$/i,
  /^(halo|hai|hi|helo)\s+(min|admin|iris|kak|guys)$/i,
  /^(apa\s*kabar|gimana\s*kabar|kabar(nya)?\s*gimana)\s*(min|admin|iris|kak)?$/i,
  /^(lagi\s*apa|sedang\s*apa)\s*(min|admin|iris|kak)?$/i,
];

const THANKS_PATTERNS = [
  /^(terima\s*kasih|makasih|thanks|thank\s*you|matur\s*suwun|trims|suwun)\s*(min|admin|iris|kak)?$/i,
  /^(oke|ok|siap|mantap|keren|siap\s*min|oke\s*min|ok\s*min|nice|wkwk|wkwkwk|haha|hahaha)\b/i,
];

const IDENTITY_PATTERNS = [
  /^(siapa\s+(kamu|anda|dirimu|iris)|kamu\s+siapa|apa\s+itu\s+iris)$/i,
];

export function checkSmalltalk(message) {
  if (typeof message !== 'string') return { triggered: false };
  const cleanMsg = message.trim();

  // 1. Check Greetings ("siang min", "pagi min", "halo min", "apa kabar")
  for (const pattern of GREETING_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      if (/pagi/i.test(cleanMsg)) {
        return {
          triggered: true,
          intent: 'GREETING',
          message: 'Selamat pagi! ☀️ Ada yang bisa aku bantu seputar jadwal, galeri, atau trivia Intan hari ini?',
        };
      }
      if (/siang/i.test(cleanMsg)) {
        return {
          triggered: true,
          intent: 'GREETING',
          message: 'Selamat siang! 🌤️ Ada yang ingin kamu tanyakan seputar kegiatan atau info Intan hari ini?',
        };
      }
      if (/sore/i.test(cleanMsg)) {
        return {
          triggered: true,
          intent: 'GREETING',
          message: 'Selamat sore! 🌇 Mau tahu info terbaru seputar show atau event Intan?',
        };
      }
      if (/malam/i.test(cleanMsg)) {
        return {
          triggered: true,
          intent: 'GREETING',
          message: 'Selamat malam! 🌙 Ada yang bisa aku bantu seputar statistik atau info Intan malam ini?',
        };
      }
      if (/kabar/i.test(cleanMsg)) {
        return {
          triggered: true,
          intent: 'GREETING',
          message: 'Kabar aku baik banget! 😊 Kamu gimana? Ada info tentang Intan yang mau kamu tanyakan hari ini?',
        };
      }

      return {
        triggered: true,
        intent: 'GREETING',
        message: 'Halo juga! 👋 Ada yang bisa aku bantu tentang Intan hari ini? Kamu bisa tanyakan seputar jadwal show, galeri foto, statistik, atau trivia Intan ya!',
      };
    }
  }

  // 2. Check Thanks & Casual Acknowledgment ("makasih min", "siap min", "oke", "keren")
  for (const pattern of THANKS_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      return {
        triggered: true,
        intent: 'THANKS',
        message: 'Sama-sama! 😊 Kalau ada yang ingin kamu tanyakan lagi tentang Intan, jangan ragu tanya aku ya!',
      };
    }
  }

  // 3. Check Identity ("siapa kamu", "kamu siapa")
  for (const pattern of IDENTITY_PATTERNS) {
    if (pattern.test(cleanMsg)) {
      return {
        triggered: true,
        intent: 'IDENTITY',
        message: 'Aku **IRIS Assistant**, copilot AI resmi untuk fan site Nur Intan (INTANIUM). Aku siap bantu kamu cari info jadwal, galeri, statistik, dan trivia seputar Intan!',
      };
    }
  }

  return { triggered: false };
}
