// Service for managing Intan News, Announcements, and Bulletins

const MOCK_NEWS = [
  {
    id: 'news-1',
    title: 'Pengumuman Resmi: Debut Anniversary Merchandise Edisi 1 Tahun!',
    date: '2025-05-10',
    summary: 'Kabar gembira bagi seluruh Intanium! Toko merchandise resmi kami akhirnya dibuka. Momen perayaan satu tahun perjalanan karir streaming Intan dimeriahkan dengan produk eksklusif hoodie premium dan standee akrilik hologram. Baca selengkapnya untuk detail produk & panduan cara memesan!',
    content: 'Kami sangat bangga mengumumkan peluncuran katalog merchandise resmi pertama Intan. Edisi terbatas ulang tahun debut ini dirancang dengan kualitas premium ganda, berisikan: \n\n1. Hoodie Cotton Fleece 330gsm dengan sablon eksklusif Chibi Intan.\n2. Standee Akrilik Hologram berkilau setinggi 15cm.\n3. Tumbler Matcha termal stainless steel.\n\nPemesanan dapat dilakukan langsung melalui tab Merchandise di website resmi ini dengan sistem pembayaran transfer bank. Seluruh keuntungan bersih didedikasikan sepenuhnya untuk peningkatan kualitas konten stream Intan di masa depan. Jangan sampai kehabisan!',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    category: 'Merch',
  },
  {
    id: 'news-2',
    title: 'Streaming Amal Ramadhan: Berbagi Kehangatan Bersama Intanium',
    date: '2025-03-25',
    summary: 'Intan bersama tim moderator komunitas menyelenggarakan siaran langsung streaming amal khusus bertajuk "Intanium Peduli". Seluruh donasi yang terkumpul akan disalurkan langsung ke panti asuhan & yayasan sosial. Baca agenda acaranya di sini!',
    content: 'Siaran langsung streaming amal Ramadhan "Intanium Peduli" akan diselenggarakan pada hari Sabtu tanggal 29 Maret pukul 19:30 WIB di channel YouTube resmi Intan. Agenda streaming meliputi curhat hangat bersama penonton, pembacaan sticky notes mading spesial Ramadhan, dan akustik nyanyi santai.\n\nSeluruh dana superchat dan donasi pihak ketiga yang terkumpul selama siaran berlangsung akan disalurkan 100% tanpa potongan apa pun ke panti asuhan mitra kita. Mari bersama berbagi berkah dan kebaikan!',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80',
    category: 'Event',
  },
];

export const newsService = {
  getNews: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_NEWS;
  },

  getNewsById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_NEWS.find(n => n.id === id) || null;
  }
};
