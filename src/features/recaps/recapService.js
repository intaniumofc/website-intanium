import { supabase } from '../../lib/supabaseClient';

export const recapService = {
  getRecaps: async () => {
    const { data, error } = await supabase
      .from('recaps')
      .select('*, recap_pages(*)');
      
    if (error) {
      console.error('Error fetching recaps:', error);
      return [];
    }
    
    return data.map(r => ({
      ...r,
      publishDate: r.publish_date,
      thumbnailUrl: r.thumbnail_url,
      pages: (r.recap_pages || []).sort((a,b) => a.page_number - b.page_number).map(p => ({
        ...p,
        imageUrl: p.image_url
      }))
    }));
  },

  getRecapById: async (id) => {
    const { data, error } = await supabase
      .from('recaps')
      .select('*, recap_pages(*)')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching recap id ${id}:`, error);
      return null;
    }
    
    return {
      ...data,
      publishDate: data.publish_date,
      thumbnailUrl: data.thumbnail_url,
      pages: (data.recap_pages || []).sort((a,b) => a.page_number - b.page_number).map(p => ({
        ...p,
        imageUrl: p.image_url
      }))
    };
  },

  deleteRecap: async (id) => {
    const { error } = await supabase.from('recaps').delete().eq('id', id);
    if (error) {
      console.error('Error deleting recap:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
