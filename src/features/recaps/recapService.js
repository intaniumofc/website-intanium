// Service for managing activity logs and Zine recap booklets

const MOCK_RECAPS = [
  {
    id: 'recap-1',
    title: 'Intanium Zine Edisi Ke-1: Menelusuri Jejak Debut',
    publishDate: '2024-07-01',
    summary: 'Majalah Zine digital perdana persembahan komunitas Intanium. Merangkum seluruh keseruan momen persiapan debut Intan, fanart perdana dari para artist berbakat, pesan-pesan haru sambutan penggemar, dan log statistik stream minggu pertama yang luar biasa.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    pages: [
      { imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', caption: 'Sampul Zine Edisi 1' },
      { imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80', caption: 'Kata Sambutan Editor' },
      { imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80', caption: 'Kumpulan Pesan Komunitas' },
      { imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80', caption: 'Penutup & Kredit Kontributor' },
    ],
  },
  {
    id: 'recap-2',
    title: 'Intanium Zine Edisi Ke-2: Spesial Summer Fest',
    publishDate: '2024-09-15',
    summary: 'Edisi kedua majalah recap yang berfokus pada kemeriahan perayaan festival musim panas bersama Intan. Berisikan transkrip wawancara eksklusif editor komunitas bersama Intan, resep matcha latte ala Intan, komik strip komedi, dan galeri fanart bertema pantai.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80',
    pages: [
      { imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80', caption: 'Cover Summer Fest Edition' },
      { imageUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=600&auto=format&fit=crop&q=80', caption: 'Summer Chat Log' },
      { imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', caption: 'Beach Art Collection' },
      { imageUrl: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&auto=format&fit=crop&q=80', caption: 'Credits & Summer Playlists' },
    ],
  },
];

export const recapService = {
  getRecaps: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_RECAPS;
  },

  getRecapById: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_RECAPS.find(r => r.id === id) || null;
  }
};
