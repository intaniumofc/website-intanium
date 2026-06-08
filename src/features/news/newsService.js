import { supabase } from '../../lib/supabaseClient';

export const newsService = {
  getNews: async () => {
    let dbNews = [];
    
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Error fetching news:', error);
    } else if (data) {
      dbNews = data.map(n => ({
        ...n,
        imageUrl: n.image_url
      }));
    }

    return dbNews;
  },

  getNewsById: async (id) => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching news id ${id}:`, error);
      return null;
    }
    
    return {
      ...data,
      imageUrl: data.image_url
    };
  },

  createNews: async (newsData) => {
    const id = newsData.id || `news-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('news')
      .insert([{
        id,
        title: newsData.title,
        date: newsData.date,
        summary: newsData.summary,
        content: newsData.content,
        image_url: newsData.image_url || newsData.imageUrl,
        category: newsData.category
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating news:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateNews: async (id, newsData) => {
    const { data, error } = await supabase
      .from('news')
      .update({
        title: newsData.title,
        date: newsData.date,
        summary: newsData.summary,
        content: newsData.content,
        image_url: newsData.image_url || newsData.imageUrl,
        category: newsData.category
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating news:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteNews: async (id) => {
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) {
      console.error('Error deleting news:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};

