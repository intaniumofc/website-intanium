// Service for managing community Fanart submissions

const MOCK_FANARTS = [
  {
    id: 'fanart-1',
    title: 'Intan in Cyberpunk Neon World',
    author: 'RezaArt23',
    description: 'Ilustrasi bertema futuristik cyberpunk neon violet, menggambarkan model Live2D Intan memakai kacamata visors bertekstur digital.',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-11-20',
  },
  {
    id: 'fanart-2',
    title: 'Chibi Intan drinking Matcha Latte',
    author: 'SakuraDraws',
    description: 'Fanart chibi menggemaskan menampilkan ekspresi senang Intan memeluk gelas Es Matcha Latte super besar. Dibuat dengan gaya warna pastel lembut.',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-10-05',
  },
  {
    id: 'fanart-3',
    title: 'Summer Party Key Visual Celebration',
    author: 'DickyDesign',
    description: 'Desain poster khusus festival musim panas bertemakan pantai tropis, lengkap dengan kembang api ungu berkilauan di latar langit malam.',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    createdAt: '2025-09-12',
  },
];

export const fanartService = {
  getFanarts: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_FANARTS;
  },

  submitFanart: async (fanartData) => {
    // In real app, write to Supabase "fanarts" table
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      message: 'Karya fanart Anda berhasil disubmit untuk proses moderasi. Terima kasih atas kontribusinya!',
      data: fanartData
    };
  }
};
