import { supabase } from '../../lib/supabaseClient';

export const galleryService = {
  getGalleryPhotos: async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*');
      
    if (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
    
    return data;
  },

  deleteGalleryPhoto: async (id) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) {
      console.error('Error deleting gallery photo:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
