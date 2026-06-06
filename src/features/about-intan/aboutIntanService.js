const INTAN_BIO = {
  fullName: 'Nur Intan',
  nickname: 'Intan / Dik Nuy',
  dateOfBirth: '23 Februari 2006',
  zodiac: 'Pisces',
  height: '157 cm',
  bloodType: 'B',
  origin: 'Bogor, Jawa Barat',
  generation: 'Generasi 13 (Trainee)',
  description: 'Intan permata yang berkilau, temukan cahayaku di hatimu!',
  socialStats: [
    { label: 'Instagram Followers', value: '@intan.jkt48', icon: '📸' },
    { label: 'Twitter / X', value: '@N_IntanJKT48', icon: '💬' },
    { label: 'TikTok Followers', value: '@jkt48.intan', icon: '📱' },
    { label: 'Showroom Room', value: 'Intan JKT48', icon: '📺' },
  ],
  trivia: [
    'Sebelum bergabung dengan JKT48, Intan aktif sebagai dancer dan sempat berpartisipasi di ajang Honda DBL Dance Competition 2023 mewakili sekolahnya, SMAN 3 Bogor.',
    'Menjadi penggemar JKT48 sejak masa kecil dan menyukai musik K-Pop, terutama sangat mengidolakan grup GFRIEND.',
    'Menunjukkan determinasi yang luar biasa dengan mengikuti audisi JKT48 berulang kali pada generasi sebelumnya sebelum akhirnya berhasil lolos di Generasi ke-13.',
    'Sempat mencoba mendaftar audisi untuk KLP48 Generasi ke-1 di Malaysia sebelum akhirnya resmi diperkenalkan sebagai trainee JKT48 pada 31 Oktober 2024.',
    'Memiliki golongan darah B dan tinggi badan 157 cm. Pendukung setianya telah mendirikan fanbase resmi bernama Intanastic.'
  ]
};

export const aboutIntanService = {
  getBio: async () => {
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return INTAN_BIO;
  }
};
