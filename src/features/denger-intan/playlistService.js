// Service for managing recommended music playlists (Denger Intan)

const MOCK_PLAYLISTS = [
  {
    id: '2aMGqrDZrqERqgMPIQe0ui',
    title: 'Ongoing New Playlist',
    description: 'Kumpulan lagu pilihan terbaru untuk menemani hari-harimu di #DengerINTAN.',
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    category: 'Juni 2026',
    badgeText: 'Ongoing Playlist',
    duration: '2h 00m',
    tracksCount: '30 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/2aMGqrDZrqERqgMPIQe0ui',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/2aMGqrDZrqERqgMPIQe0ui?utm_source=generator',
    curatorNote: 'Hai Intanium! Ini playlist Ongoing terbaru khusus buat nemenin aktivitas kalian bulan ini. Selamat mendengarkan! ✨'
  },
  {
    id: '4jLqcyPlFe7hdFFOr1r0ML',
    title: 'Archive Playlist Vol. 3',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    category: 'Mei 2026',
    badgeText: 'Archive Playlist',
    duration: '1h 45m',
    tracksCount: '25 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/4jLqcyPlFe7hdFFOr1r0ML',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/4jLqcyPlFe7hdFFOr1r0ML?utm_source=generator',
    curatorNote: 'Halo semuanya! Ini adalah arsip playlist bulan lalu. Tetap asyik buat didengerin ulang sambil santai atau nugas kok! 🎧'
  },
  {
    id: '6azVHz2MOw9d0oJrZxmpul',
    title: 'Archive Playlist Vol. 2',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=600&auto=format&fit=crop',
    category: 'April 2026',
    badgeText: 'Archive Playlist',
    duration: '2h 15m',
    tracksCount: '35 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/6azVHz2MOw9d0oJrZxmpul',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/6azVHz2MOw9d0oJrZxmpul?utm_source=generator',
    curatorNote: 'Kumpulan lagu penuh memori dari kurasi edisi lalu. Jangan lupa cek track favorit kalian di sini ya! 🎸'
  },
  {
    id: '1zpGEcM4GlAyz4kpvjJUK9',
    title: 'Archive Playlist Vol. 1',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    category: 'Maret 2026',
    badgeText: 'Archive Playlist',
    duration: '1h 30m',
    tracksCount: '20 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/1zpGEcM4GlAyz4kpvjJUK9',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/1zpGEcM4GlAyz4kpvjJUK9?utm_source=generator',
    curatorNote: 'Kilas balik ke playlist awal #DengerINTAN. Isinya lagu-lagu nostalgic yang bakal bikin kamu ikutan sing-along! 🎤☀️'
  },
  {
    id: '7ts54pSqOxEqK7Mcr7wsPf',
    title: 'Archive Playlist Vol. 5',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    category: 'Februari 2026',
    badgeText: 'Archive Playlist',
    duration: '2h 05m',
    tracksCount: '28 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/7ts54pSqOxEqK7Mcr7wsPf',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/7ts54pSqOxEqK7Mcr7wsPf?utm_source=generator',
    curatorNote: 'Koleksi tambahan arsip lagu kurasi pilihan untuk menemani waktu santaimu bersama #DengerINTAN. 🎶'
  },
  {
    id: '3ylSh5l2hqkakZqX09FAFL',
    title: 'Archive Playlist Vol. 6',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=600&auto=format&fit=crop',
    category: 'Januari 2026',
    badgeText: 'Archive Playlist',
    duration: '1h 50m',
    tracksCount: '24 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/3ylSh5l2hqkakZqX09FAFL',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/3ylSh5l2hqkakZqX09FAFL?utm_source=generator',
    curatorNote: 'Koleksi tambahan arsip lagu kurasi pilihan untuk menemani waktu santaimu bersama #DengerINTAN. 🎶'
  }
];

export const playlistService = {
  getPlaylists: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PLAYLISTS;
  }
};

