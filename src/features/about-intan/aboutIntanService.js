// Service for managing and fetching data about Intan (Biography, Trivia, Streaming Stats)

const INTAN_BIO = {
  fullName: 'Intan',
  nickname: 'Intan / Intan-chan',
  debutDate: '2024-05-15',
  zodiac: 'Taurus',
  height: '158 cm',
  description: 'Intan adalah virtual content creator dan entertainer berbakat asal Indonesia yang berfokus pada gaming, interactive talk shows, cover lagu, dan pembuatan konten kreatif digital. Dengan pembawaan yang ramah, menghibur, dan penuh energi positif, Intan berhasil merangkul ribuan penggemar setianya yang tergabung dalam komunitas "Intanium".',
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
