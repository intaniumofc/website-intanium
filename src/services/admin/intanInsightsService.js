import { supabase } from '../../lib/supabaseClient';

// ==========================================
// INTAN INSIGHTS SERVICE
// Data agregat untuk dashboard /admin/intan-insights.
// Seluruh agregasi dihitung di database via SQL views
// (lihat database/migration_intan_insights.sql).
// ==========================================
export const intanInsightsService = {
  // KPI ringkasan lintas tabel (satu baris)
  getSummary: async () => {
    const { data, error } = await supabase
      .from('v_intan_content_summary')
      .select('*')
      .single();
    if (error) { console.error('Error fetching v_intan_content_summary:', error); return null; }
    return data;
  },

  // Chart utama: jumlah show per setlist + jumlah unit songs
  getSetlistShows: async () => {
    const { data, error } = await supabase
      .from('v_intan_setlist_shows')
      .select('*')
      .order('show_count', { ascending: false });
    if (error) { console.error('Error fetching v_intan_setlist_shows:', error); return []; }
    return data;
  },

  // Jumlah video highlight per kategori
  getVideoByCategory: async () => {
    const { data, error } = await supabase
      .from('v_intan_video_by_category')
      .select('*')
      .order('video_count', { ascending: false });
    if (error) { console.error('Error fetching v_intan_video_by_category:', error); return []; }
    return data;
  },

  // Achievement per bulan per kategori, dengan filter opsional
  getAchievementMonthly: async ({ from, to, categories } = {}) => {
    let query = supabase
      .from('v_intan_achievement_monthly')
      .select('*')
      .order('month', { ascending: true });
    if (from) query = query.gte('month', from);
    if (to) query = query.lte('month', to);
    if (categories && categories.length > 0) query = query.in('category', categories);
    const { data, error } = await query;
    if (error) { console.error('Error fetching v_intan_achievement_monthly:', error); return []; }
    return data;
  },

  // Detail achievement untuk drill-down bulan tertentu
  getAchievementsInMonth: async (monthStart, monthEnd) => {
    const { data, error } = await supabase
      .from('intan_shining_star_achievements')
      .select('id, sort_date, title, category, is_major')
      .gte('sort_date', monthStart)
      .lte('sort_date', monthEnd)
      .order('sort_date', { ascending: true });
    if (error) { console.error('Error fetching achievements drill-down:', error); return []; }
    return data;
  },

  // Unit songs sebuah setlist untuk panel detail
  getUnitSongs: async (setlistId) => {
    const { data, error } = await supabase
      .from('intan_unit_songs')
      .select('song_name, sort_order')
      .eq('setlist_id', setlistId)
      .order('sort_order', { ascending: true });
    if (error) { console.error('Error fetching intan_unit_songs:', error); return []; }
    return data;
  },

  // Jumlah event JKT48 per bulan (konteks timeline umum)
  getEventsTimeline: async ({ from, to } = {}) => {
    let query = supabase
      .from('v_intan_events_monthly')
      .select('*')
      .order('month', { ascending: true });
    if (from) query = query.gte('month', from);
    if (to) query = query.lte('month', to);
    const { data, error } = await query;
    if (error) { console.error('Error fetching v_intan_events_monthly:', error); return []; }
    return data;
  },
};
