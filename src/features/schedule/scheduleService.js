import { supabase } from '../../lib/supabaseClient';

export const scheduleService = {
  getEvents: async (status = 'all', platform = 'All') => {
    let query = supabase.from('events').select('*');

    if (platform !== 'All') {
      query = query.eq('platform', platform);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    let result = data;
    if (status !== 'all') {
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;

      if (status === 'upcoming') {
        result = result.filter(e => new Date(e.time).getTime() - now > 0);
      } else if (status === 'completed') {
        result = result.filter(e => {
          const diff = new Date(e.time).getTime() - now;
          return diff < 0 && Math.abs(diff) > twoHoursMs;
        });
      } else if (status === 'live') {
        result = result.filter(e => {
          const diff = new Date(e.time).getTime() - now;
          return diff <= 0 && Math.abs(diff) <= twoHoursMs;
        });
      }
    }

    return result;
  },

  deleteEvent: async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
