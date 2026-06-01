// Service for managing Intan's Discography & cover song releases

const MOCK_DISCOGRAPHY = [
  {
    id: 'disco-1',
    title: 'Melodi Senja (Original Cover)',
    releaseDate: '2025-05-15',
    type: 'Single',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/album/mock-senja',
    youtubeUrl: 'https://youtube.com/watch?v=mock-senja',
    tracklist: [
      { trackNum: 1, title: 'Melodi Senja', duration: '3:45' },
      { trackNum: 2, title: 'Melodi Senja (Instrumental)', duration: '3:45' },
    ],
  },
  {
    id: 'disco-2',
    title: 'Matcha Vibes Lofi EP',
    releaseDate: '2024-11-20',
    type: 'EP Album',
    artworkUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    spotifyUrl: 'https://open.spotify.com/album/mock-matcha',
    youtubeUrl: 'https://youtube.com/watch?v=mock-matcha',
    tracklist: [
      { trackNum: 1, title: 'Morning Brew Lofi', duration: '2:15' },
      { trackNum: 2, title: 'Cookies & Chill Session', duration: '2:40' },
      { trackNum: 3, title: 'Rainy Day Talk Shows theme', duration: '3:10' },
    ],
  },
];

export const discographyService = {
  getAlbums: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_DISCOGRAPHY;
  }
};
