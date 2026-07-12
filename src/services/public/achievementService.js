import { supabase } from '../../lib/supabaseClient';
import intanProfile from '../../assets/images/Nur_Intan.webp';
import intanPoster from '../../assets/images/intan-02.webp';
import intanFour from '../../assets/images/intan-04.webp';

export const ACHIEVEMENT_CATEGORIES = [
  'Milestone',
  'Theater',
  'Live',
  'Video Call',
  'Event',
  'Content',
  'Fan Project',
];

const FALLBACK_ACHIEVEMENTS = [
  {
    id: 'gen13-introduction',
    date: '31 Desember 2024',
    sortDate: '2024-12-31',
    title: 'Resmi Menjadi JKT48 Generasi 13',
    category: 'Milestone',
    description:
      'Setelah melewati beberapa proses audisi, Intan resmi memulai babak baru sebagai trainee JKT48 Generasi 13.',
    image: intanProfile,
    isMajor: true,
    showInAchievement: true,
    showInTimeline: true,
  },
  {
    id: 'profile-content',
    date: '1 Maret 2025',
    sortDate: '2025-03-01',
    title: 'JKT48 13th Generation Profile: Intan',
    category: 'Content',
    description:
      'Konten profil generasi memperkenalkan karakter, energi, dan cerita Intan kepada lebih banyak penggemar.',
    image: intanPoster,
    showInAchievement: true,
    showInTimeline: true,
  },
  {
    id: 'first-theater-backdancer',
    date: '19 Oktober 2025',
    sortDate: '2025-10-19',
    title: 'Penampilan Perdana sebagai Backdancer',
    category: 'Theater',
    description:
      'Intan tampil sebagai backdancer untuk lagu Glory Days pada JKT48 5th Stage, menjadi langkah penting dalam perjalanan panggungnya.',
    image: intanFour,
    isMajor: true,
    showInAchievement: true,
    showInTimeline: true,
  },
];

const formatDate = (date) => {
  if (!date) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
};

const mapAchievement = (item) => ({
  id: item.id,
  date: formatDate(item.sort_date),
  sortDate: item.sort_date,
  title: item.title,
  category: item.category,
  description: item.description,
  image: item.image_url,
  isMajor: item.is_major,
  showInAchievement: item.show_in_achievement,
  showInTimeline: item.show_in_timeline,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

const toPayload = (item) => ({
  sort_date: item.sortDate,
  title: item.title?.trim(),
  category: item.category,
  description: item.description?.trim(),
  image_url: item.image?.trim() || null,
  is_major: Boolean(item.isMajor),
  show_in_achievement: Boolean(item.showInAchievement),
  show_in_timeline: Boolean(item.showInTimeline),
});

export const achievementService = {
  getAchievements: async () => {
    const { data, error } = await supabase
      .from('intan_shining_star_achievements')
      .select('*')
      .or('show_in_achievement.eq.true,show_in_timeline.eq.true')
      .order('sort_date', { ascending: true });

    if (error) {
      console.error('Error fetching Intan Shining Star achievements:', error);
      return [...FALLBACK_ACHIEVEMENTS];
    }

    return data.map(mapAchievement);
  },

  getAdminAchievements: async () => {
    const { data, error } = await supabase
      .from('intan_shining_star_achievements')
      .select('*')
      .order('sort_date', { ascending: false });

    if (error) {
      console.error('Error fetching admin Intan Shining Star achievements:', error);
      return [];
    }

    return data.map(mapAchievement);
  },

  createAchievement: async (achievement) => {
    const id = achievement.id?.trim() || `achievement-${Date.now()}`;
    const { data, error } = await supabase
      .from('intan_shining_star_achievements')
      .insert([{ id, ...toPayload(achievement) }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: mapAchievement(data) };
  },

  updateAchievement: async (id, achievement) => {
    const { data, error } = await supabase
      .from('intan_shining_star_achievements')
      .update(toPayload(achievement))
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: mapAchievement(data) };
  },

  deleteAchievement: async (id) => {
    const { error } = await supabase
      .from('intan_shining_star_achievements')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
