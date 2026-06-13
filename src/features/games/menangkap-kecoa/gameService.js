import { supabase } from '../../../lib/supabaseClient';

export async function submitGameScore({
  username,
  score,
  caughtCount,
  maxCombo,
  title,
}) {
  const { data, error } = await supabase
    .from('game_scores')
    .insert({
      username,
      score,
      caught_count: caughtCount,
      max_combo: maxCombo,
      mode: 'classic',
      title,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export function getStartOfWeekUTC() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = now.getUTCDate() - (day === 0 ? 6 : day - 1);
  const startOfWeek = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff, 0, 0, 0, 0));
  return startOfWeek.toISOString();
}

export async function getGameLeaderboard(limit = 20, period = 'weekly') {
  let query = supabase
    .from('game_scores')
    .select('id, username, score, caught_count, max_combo, title, created_at')
    .eq('mode', 'classic');

  if (period === 'weekly') {
    const startOfWeek = getStartOfWeekUTC();
    query = query.gte('created_at', startOfWeek);
  }

  const { data, error } = await query
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}


export async function getGameScore(id) {
  const { data, error } = await supabase
    .from('game_scores')
    .select('id, username, score, caught_count, max_combo, title, created_at')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function adminDeleteGameScore(id) {
  const { error } = await supabase
    .from('game_scores')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

export async function adminResetLeaderboard(period = 'weekly') {
  let query = supabase.from('game_scores').delete();

  if (period === 'weekly') {
    const startOfWeek = getStartOfWeekUTC();
    query = query.gte('created_at', startOfWeek);
  }

  const { error } = await query;
  if (error) throw error;
  return { success: true };
}

export async function adminPruneGameScores() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error } = await supabase
    .from('game_scores')
    .delete()
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;
  return { success: true };
}

export async function getAdminGameScores({ search = '', period = 'all-time', sortBy = 'score_desc' } = {}) {
  let query = supabase
    .from('game_scores')
    .select('*');

  if (search) {
    query = query.ilike('username', `%${search}%`);
  }

  if (period === 'weekly') {
    const startOfWeek = getStartOfWeekUTC();
    query = query.gte('created_at', startOfWeek);
  }

  if (sortBy === 'score_desc') {
    query = query.order('score', { ascending: false }).order('created_at', { ascending: true });
  } else if (sortBy === 'score_asc') {
    query = query.order('score', { ascending: true }).order('created_at', { ascending: false });
  } else if (sortBy === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sortBy === 'oldest') {
    query = query.order('created_at', { ascending: true });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getGameSettings() {
  const { data, error } = await supabase
    .from('merchandise')
    .select('*')
    .eq('id', 'game_settings')
    .maybeSingle();

  const DEFAULT_SETTINGS = {
    featuredGameId: 'menangkap-kecoa',
    challengeCount: 100,
    challengeReward: 'Hall of Fame',
    challengeActive: true,
    games: {
      'menangkap-kecoa': { 
        active: true, 
        title: 'Menangkap Kecoa',
        description: 'Uji kecepatan tanganmu menangkap kecoa-kecoa terbang sebelum mereka lolos dan raih skor tertinggi!',
        badge: 'Populer', 
        difficulty: 'Mudah', 
        playTime: '60 Detik',
        theme: 'amber',
        emoji: '🐜',
        icon: 'Bug',
        link: '/games/menangkap-kecoa',
        bgImage: 'cockroachBg',
        layoutSpan: 2
      },
      'tebak-kata': { 
        active: false, 
        title: 'Tebak Kata',
        description: 'Seberapa kenal kamu dengan lore komunitas Intanium dan Kak Intan? Susun huruf dan pecahkan teka-teki kata ini.',
        badge: 'Segera Hadir', 
        difficulty: 'Sedang', 
        playTime: '3 Menit',
        theme: 'cyan',
        emoji: '🧩',
        icon: 'HelpCircle',
        link: 'modal:tebak-kata',
        bgImage: 'tebakKataBg',
        layoutSpan: 1
      },
      'intan-run': { 
        active: false, 
        title: 'Intanium Adventure',
        description: 'Game petualangan platformer seru menjelajahi dunia fantasi Intanium dan mengumpulkan batu permata indah.',
        badge: 'Segera Hadir', 
        difficulty: 'Sulit', 
        playTime: 'Tanpa Batas',
        theme: 'purple',
        emoji: '⚡',
        icon: 'Zap',
        link: '#',
        bgImage: 'intanRunBg',
        layoutSpan: 1
      }
    },
    stats: {
      totalPlayers: 1254,
      totalGamesPlayed: 8420,
      avgScore: 582
    }
  };

  if (error || !data) {
    if (error) console.error('Error fetching game settings:', error);
    return DEFAULT_SETTINGS;
  }

  try {
    const settings = JSON.parse(data.description);
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      games: { ...DEFAULT_SETTINGS.games, ...(settings.games || {}) },
      stats: { ...DEFAULT_SETTINGS.stats, ...(settings.stats || {}) }
    };
  } catch (e) {
    console.error('Error parsing game settings description:', e);
    return DEFAULT_SETTINGS;
  }
}

export async function updateGameSettings(settings) {
  const payload = {
    id: 'game_settings',
    name: 'Game Settings',
    price: 0,
    category: 'Settings',
    description: JSON.stringify(settings),
    is_available: false,
    sizes: []
  };

  const { data, error } = await supabase
    .from('merchandise')
    .upsert([payload])
    .select()
    .single();

  if (error) {
    console.error('Error updating game settings:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}



