import { supabase } from '../../lib/supabaseClient';

export const comicPageService = {
  getPages: async () => {
    const { data, error } = await supabase
      .from('intan_shining_star_comic_pages')
      .select('*')
      .order('page_number', { ascending: true });

    if (error) {
      console.error('Error fetching comic pages:', error);
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      pageNumber: p.page_number,
      imageUrl: p.image_url,
      caption: p.caption || '',
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  },

  createPage: async (page) => {
    const id = page.id?.trim() || `comic-${Date.now()}`;
    const { data, error } = await supabase
      .from('intan_shining_star_comic_pages')
      .insert([{
        id,
        page_number: page.pageNumber,
        image_url: page.imageUrl?.trim() || null,
        caption: page.caption?.trim() || '',
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: { id: data.id, pageNumber: data.page_number, imageUrl: data.image_url, caption: data.caption } };
  },

  updatePage: async (id, page) => {
    const { data, error } = await supabase
      .from('intan_shining_star_comic_pages')
      .update({
        page_number: page.pageNumber,
        image_url: page.imageUrl?.trim() || null,
        caption: page.caption?.trim() || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, data: { id: data.id, pageNumber: data.page_number, imageUrl: data.image_url, caption: data.caption } };
  },

  deletePage: async (id) => {
    const { error } = await supabase
      .from('intan_shining_star_comic_pages')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
