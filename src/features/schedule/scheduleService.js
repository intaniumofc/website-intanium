// Service for managing stream events and activity schedules

const MOCK_EVENTS = [
  {
    id: 'event-1',
    title: 'Spesial Ulang Tahun Debut Stream: Q&A & Cover Song Reveal!',
    description: 'Datang dan ramaikan pesta kemeriahan 1 tahun debut streaming Intan! Ada sesi tanya jawab intim bersama member Discord, reveal lagu cover orisinal terbaru, dan bagi-bagi merchandise kaos limited gratis!',
    time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    platform: 'YouTube',
    link: 'https://youtube.com/watch?v=mock-debut',
    duration: '3 jam',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'event-2',
    title: 'Minecraft Multiplayer: Membangun Kuil Intanium Raksasa!',
    description: 'Sesi kolaborasi mabar (main bareng) bersama member tier VIP Discord. Kita akan bergotong-royong membangun kastil megah berbahan dasar blok kaca ungu dan prismarine di server survival!',
    time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // In 3 Days
    platform: 'Twitch',
    link: 'https://twitch.tv/mock-intan',
    duration: '4 jam',
    thumbnail: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'event-3',
    title: 'Review Mading Komunitas & Baca Surat Curhat Penggemar',
    description: 'Membaca dan mereview pesan-pesan kocak, gambar fanart tergokil, dan curhat hangat yang masuk di papan Mading digital website resmi Intanium.',
    time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago (Completed or Live)
    platform: 'YouTube',
    link: 'https://youtube.com/watch?v=mock-mading',
    duration: '2 jam',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  },
];

export const scheduleService = {
  getEvents: async (status = 'all', platform = 'All') => {
    await new Promise(resolve => setTimeout(resolve, 250));
    let result = [...MOCK_EVENTS];

    if (platform !== 'All') {
      result = result.filter(e => e.platform === platform);
    }

    if (status !== 'all') {
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      if (status === 'upcoming') {
        result = result.filter(e => new Date(e.time).getTime() - now > 0);
      } else if (status === 'completed') {
        result = result.filter(e => {
          const diff = new Date(e.time).getTime() - now;
          return diff < 0 && Math.abs(diff) > twoHoursMs;
        });
      } else if (status === 'live') {
        result = result.filter(e => {
          const diff = new Date(e.time).getTime() - now;
          return diff <= 0 && Math.abs(diff) <= twoHoursMs;
        });
      }
    }

    return result;
  }
};
