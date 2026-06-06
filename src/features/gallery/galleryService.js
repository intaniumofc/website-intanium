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
    
    return data.map(item => ({
      ...item,
      display_type: item.display_type || 'gallery'
    }));
  },

  createGalleryPhoto: async (photoData) => {
    const id = photoData.id || `gallery-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('gallery')
      .insert([{ ...photoData, id }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating gallery photo:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateGalleryPhoto: async (id, photoData) => {
    const { data, error } = await supabase
      .from('gallery')
      .update(photoData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating gallery photo:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
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

