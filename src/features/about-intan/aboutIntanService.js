const INTAN_BIO = {
  fullName: 'Nur Intan',
  nickname: 'Dik Nuy',
  dateOfBirth: '24 Februari 2006',
  zodiac: 'Pisces',
  height: '157 cm',
  description: 'Intan permata yang berkilau, temukan cahaya ku di hatimu!',
  socialStats: [
    { label: 'YouTube Subscribers', value: '45,000+', icon: '📺' },
    { label: 'Instagram Followers', value: '12,500+', icon: '📸' },
    { label: 'Discord Members', value: '8,200+', icon: '💬' },
    { label: 'TikTok Views', value: '1.2M+', icon: '📱' },
  ],
  trivia: [
    'Sangat menyukai minuman Es Matcha Latte dan cookies rasa cokelat.',
    'Paling anti dengan makanan pedas atau buah durian.',
    'Game favorit sepanjang masa adalah RPG Story Rich dan indie simulation.',
    'Suka menyanyi lagu bernuansa city pop 80-an dan lofi chill.',
  ]
};

export const aboutIntanService = {
  getBio: async () => {
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return INTAN_BIO;
  }
};
