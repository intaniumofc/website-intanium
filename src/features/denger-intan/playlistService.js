// Service for managing recommended music playlists (Denger Intan)

const MOCK_PLAYLISTS = [
  {
    id: 'play-1',
    title: 'Matcha Chill Session (Lofi Playlists)',
    description: 'Kumpulan lagu lofi instrumental super rileks yang menemani Intan saat menggambar fanart atau sekedar mengobrol santai di malam hari.',
    embedUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', // Lofi girl stream
    category: 'Lofi Chill',
  },
  {
    id: 'play-2',
    title: 'Intan Upbeat Gaming Anthems',
    description: 'Pilihan lagu pop-punk dan anisong penuh semangat membara yang selalu diputar Intan untuk meningkatkan fokus saat bertarung di game aksi kompetitif!',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1', // Dummy playlist
    category: 'Gaming Upbeat',
  },
];

export const playlistService = {
  getPlaylists: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_PLAYLISTS;
  }
};
