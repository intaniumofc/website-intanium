// Service for managing Intan's milestones achievements (Shining Stars)

const MOCK_ACHIEVEMENTS = [
  {
    id: 'ach-1',
    title: 'Menembus 45,000 Subscribers YouTube!',
    description: 'Sebuah pencapaian luar biasa berkat dukungan tiada henti seluruh rekan-rekan Intanium. Stream perayaan khusus diselenggarakan berdurasi 6 jam nonstop!',
    date: '2025-10-10',
    category: 'Milestone',
    icon: '🥳',
  },
  {
    id: 'ach-2',
    title: 'Peluncuran Zine Recap Edisi Perdana',
    description: 'Tim redaksi komunitas berkolaborasi erat menerbitkan e-magazine perdana yang diunduh oleh lebih dari 3,000 member di hari pertama perilisan.',
    date: '2024-07-01',
    category: 'Event',
    icon: '📖',
  },
  {
    id: 'ach-3',
    title: 'Official Merchandise Shop Resmi Dibuka!',
    description: 'Koleksi merchandise hoodie limited dan standee akrilik resmi diluncurkan secara publik melalui portal website resmi Intanium.',
    date: '2024-06-12',
    category: 'Release',
    icon: '🛍️',
  },
  {
    id: 'ach-4',
    title: 'Debut Streaming Pertama Kalinya!',
    description: 'Langkah bersejarah perjalanan karir Intan dimulai! Menghadirkan model Live2D orisinal bertema modern casual sci-fi.',
    date: '2024-05-15',
    category: 'Milestone',
    icon: '🚀',
  },
];

export const achievementService = {
  getAchievements: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return MOCK_ACHIEVEMENTS;
  }
};
