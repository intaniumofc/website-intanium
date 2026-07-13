// Service for fetching IRIS Community Lore and Rules

const IRIS_LORE = {
  originStory: 'Komunitas "IRIS" terbentuk secara organik oleh para penggemar setia Intan sejak awal debut streamingnya pada Mei 2024. Nama IRIS melambangkan cahaya, harapan, dan keindahan yang terus mekar bersama perjalanan karir Intan di panggung JKT48—seperti kelopak bunga iris yang membuka diri menuju sinar. Filosofi ini mencerminkan semangat ikatan persahabatan fans yang kokoh dan selalu mendukung Intan dalam kondisi apa pun.',
  rules: [
    { title: 'Saling Menghormati', desc: 'Jaga keramahtamahan, toleransi, hindari ujaran kebencian, SARA, bullying, dan diskriminasi di platform mana pun.' },
    { title: 'Hindari Perdebatan (No Drama)', desc: 'Fokus pada konten hiburan positif. Jauhkan pembahasan drama tidak sehat atau perbandingan negatif antar sesama kreator.' },
    { title: 'Dukung Karya Orisinal', desc: 'Hargai hak cipta, selalu cantumkan kredit asli saat mengunggah ulang karya fanart atau zine buatan kreator lain.' },
    { title: 'Ikuti Peraturan Platform', desc: 'Patuhi aturan Discord, YouTube chat, Instagram, dan rules chat streaming agar suasana tetap kondusif.' },
  ],
  joinSteps: [
    { step: 1, action: 'Subscribe Channel Utama', detail: 'Subscribe YouTube Intan dan aktifkan bel notifikasi.' },
    { step: 2, action: 'Masuk Discord Server', detail: 'Klik link undangan Discord resmi untuk berbaur dengan ribuan member.' },
    { step: 3, action: 'Pilih Role Komunitas', detail: 'Lakukan verifikasi dan dapatkan tag role Anda di dalam server.' },
    { step: 4, action: 'Ikuti Akun Media Sosial', detail: 'Follow Twitter, Instagram dan TikTok untuk berita terkini.' },
  ]
};

export const aboutIrisService = {
  getLore: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return IRIS_LORE;
  }
};
