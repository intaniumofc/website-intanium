import { supabase } from '../../lib/supabaseClient';

export const esportService = {
  // === Divisions ===
  getDivisions: async () => {
    const { data, error } = await supabase
      .from('esport_divisions')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.error('Error fetching divisions:', error);
      return [];
    }
    return data;
  },

  createDivision: async (divisionData) => {
    const { data, error } = await supabase
      .from('esport_divisions')
      .insert([divisionData])
      .select()
      .single();
    if (error) {
      console.error('Error creating division:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateDivision: async (id, divisionData) => {
    const { data, error } = await supabase
      .from('esport_divisions')
      .update(divisionData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating division:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteDivision: async (id) => {
    const { error } = await supabase
      .from('esport_divisions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error deleting division:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  // === Rosters ===
  getRosters: async (divisionId = null) => {
    let query = supabase.from('esport_rosters').select('*');
    if (divisionId) {
      query = query.eq('division_id', divisionId);
    }
    const { data, error } = await query.order('sort_order', { ascending: true });
    if (error) {
      console.error('Error fetching rosters:', error);
      return [];
    }
    return data;
  },

  createRoster: async (rosterData) => {
    const { data, error } = await supabase
      .from('esport_rosters')
      .insert([rosterData])
      .select()
      .single();
    if (error) {
      console.error('Error creating roster:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateRoster: async (id, rosterData) => {
    const { data, error } = await supabase
      .from('esport_rosters')
      .update(rosterData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating roster:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteRoster: async (id) => {
    const { error } = await supabase.from('esport_rosters').delete().eq('id', id);
    if (error) {
      console.error('Error deleting roster:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  // === Matches ===
  getMatches: async (divisionId = null) => {
    let query = supabase.from('esport_matches').select('*');
    if (divisionId) {
      query = query.eq('division_id', divisionId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
    return data;
  },

  createMatch: async (matchData) => {
    const { data, error } = await supabase
      .from('esport_matches')
      .insert([matchData])
      .select()
      .single();
    if (error) {
      console.error('Error creating match:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateMatch: async (id, matchData) => {
    const { data, error } = await supabase
      .from('esport_matches')
      .update(matchData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating match:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteMatch: async (id) => {
    const { error } = await supabase.from('esport_matches').delete().eq('id', id);
    if (error) {
      console.error('Error deleting match:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  // === Achievements ===
  getAchievements: async (divisionId = null) => {
    let query = supabase.from('esport_achievements').select('*');
    if (divisionId) {
      query = query.eq('division_id', divisionId);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
    return data;
  },

  createAchievement: async (achievementData) => {
    const { data, error } = await supabase
      .from('esport_achievements')
      .insert([achievementData])
      .select()
      .single();
    if (error) {
      console.error('Error creating achievement:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateAchievement: async (id, achievementData) => {
    const { data, error } = await supabase
      .from('esport_achievements')
      .update(achievementData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating achievement:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteAchievement: async (id) => {
    const { error } = await supabase.from('esport_achievements').delete().eq('id', id);
    if (error) {
      console.error('Error deleting achievement:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
