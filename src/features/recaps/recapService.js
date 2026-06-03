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

  createRecap: async (recapData, pagesData = []) => {
    const id = recapData.id || `recap-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data: recap, error: recapError } = await supabase
      .from('recaps')
      .insert([{
        id,
        title: recapData.title,
        publish_date: recapData.publish_date || recapData.publishDate,
        summary: recapData.summary,
        thumbnail_url: recapData.thumbnail_url || recapData.thumbnailUrl
      }])
      .select()
      .single();

    if (recapError) {
      console.error('Error creating recap:', recapError);
      return { success: false, error: recapError.message };
    }

    if (pagesData.length > 0) {
      const inserts = pagesData.map((p, index) => ({
        recap_id: id,
        image_url: p.image_url || p.imageUrl,
        caption: p.caption || '',
        page_number: p.page_number !== undefined ? p.page_number : (index + 1)
      }));
      const { error: pagesError } = await supabase
        .from('recap_pages')
        .insert(inserts);
      if (pagesError) {
        console.error('Error inserting recap pages:', pagesError);
        return { success: false, error: pagesError.message };
      }
    }

    return { success: true, data: recap };
  },

  updateRecap: async (id, recapData, pagesData = []) => {
    const { data: recap, error: recapError } = await supabase
      .from('recaps')
      .update({
        title: recapData.title,
        publish_date: recapData.publish_date || recapData.publishDate,
        summary: recapData.summary,
        thumbnail_url: recapData.thumbnail_url || recapData.thumbnailUrl
      })
      .eq('id', id)
      .select()
      .single();

    if (recapError) {
      console.error('Error updating recap:', recapError);
      return { success: false, error: recapError.message };
    }

    const { error: deleteError } = await supabase
      .from('recap_pages')
      .delete()
      .eq('recap_id', id);

    if (deleteError) {
      console.error('Error clearing old recap pages:', deleteError);
      return { success: false, error: deleteError.message };
    }

    if (pagesData.length > 0) {
      const inserts = pagesData.map((p, index) => ({
        recap_id: id,
        image_url: p.image_url || p.imageUrl,
        caption: p.caption || '',
        page_number: p.page_number !== undefined ? p.page_number : (index + 1)
      }));
      const { error: pagesError } = await supabase
        .from('recap_pages')
        .insert(inserts);
      if (pagesError) {
        console.error('Error inserting new recap pages:', pagesError);
        return { success: false, error: pagesError.message };
      }
    }

    return { success: true, data: recap };
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

