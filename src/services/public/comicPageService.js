import { supabase } from '../../lib/supabaseClient';
import { proxyR2Url } from '../../lib/helpers';

export const comicPageService = {
  getPages: async () => {
    try {
      const { data, error } = await supabase
        .from('intan_shining_star_comic_pages')
        .select('*')
        .order('page_number', { ascending: true });

      if (error) {
        console.warn('Comic pages query returned warning/error:', error.message || error.details || error);
        return [];
      }

      if (!data) return [];

      return data.map((p) => ({
        id: p.id,
        pageNumber: p.page_number,
        imageUrl: proxyR2Url(p.image_url),
        caption: p.caption || '',
        chapterNumber: p.chapter_number || 1,
        chapterTitle: p.chapter_title || '',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
    } catch (err) {
      console.warn('Exception while fetching comic pages:', err.message || err);
      return [];
    }
  },

  createPage: async (page) => {
    const id = page.id?.trim() || `comic-${Date.now()}`;
    const { data, error } = await supabase
      .from('intan_shining_star_comic_pages')
      .insert([{
        id,
        page_number: Number(page.pageNumber),
        image_url: page.imageUrl?.trim() || null,
        caption: page.caption?.trim() || '',
        chapter_number: Number(page.chapterNumber || 1),
        chapter_title: page.chapterTitle?.trim() || '',
      }])
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: {
        id: data.id,
        pageNumber: data.page_number,
        imageUrl: proxyR2Url(data.image_url),
        caption: data.caption,
        chapterNumber: data.chapter_number || 1,
        chapterTitle: data.chapter_title || '',
      },
    };
  },

  updatePage: async (id, page) => {
    const { data, error } = await supabase
      .from('intan_shining_star_comic_pages')
      .update({
        page_number: Number(page.pageNumber),
        image_url: page.imageUrl?.trim() || null,
        caption: page.caption?.trim() || '',
        chapter_number: Number(page.chapterNumber || 1),
        chapter_title: page.chapterTitle?.trim() || '',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      data: {
        id: data.id,
        pageNumber: data.page_number,
        imageUrl: proxyR2Url(data.image_url),
        caption: data.caption,
        chapterNumber: data.chapter_number || 1,
        chapterTitle: data.chapter_title || '',
      },
    };
  },

  deletePage: async (id) => {
    const { error } = await supabase
      .from('intan_shining_star_comic_pages')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  reorderPages: async (orderedItems) => {
    try {
      const updates = orderedItems.map((item, index) => ({
        id: item.id,
        page_number: index + 1,
        image_url: item.imageUrl || null,
        caption: item.caption || '',
        chapter_number: Number(item.chapterNumber || 1),
        chapter_title: item.chapterTitle || '',
      }));

      const { error } = await supabase
        .from('intan_shining_star_comic_pages')
        .upsert(updates);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  syncChapterTitle: async (chapterNumber, chapterTitle) => {
    try {
      const { error } = await supabase
        .from('intan_shining_star_comic_pages')
        .update({ chapter_title: chapterTitle || '' })
        .eq('chapter_number', Number(chapterNumber));

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
};
