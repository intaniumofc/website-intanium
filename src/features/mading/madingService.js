import { supabase } from '../../lib/supabaseClient';
import { generateId } from '../../lib/helpers';

export const madingService = {
  getNotes: async () => {
    const { data, error } = await supabase
      .from('mading_notes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching mading notes:', error);
      return [];
    }
    // Rename columns to camelCase for the frontend if needed, but assuming components read theme_color or we map it:
    return data.map(note => ({
      ...note,
      themeColor: note.theme_color,
      createdAt: note.created_at,
      isAdmin: note.is_admin
    }));
  },

  postNote: async (noteData) => {
    const newNote = {
      id: generateId(),
      name: noteData.name || 'Anonim',
      message: noteData.message,
      theme_color: noteData.themeColor || 'yellow',
      is_admin: false,
    };
    
    const { data, error } = await supabase
      .from('mading_notes')
      .insert([newNote])
      .select()
      .single();
      
    if (error) {
      console.error('Error posting mading note:', error);
      throw error;
    }
    
    return {
      ...data,
      themeColor: data.theme_color,
      createdAt: data.created_at,
      isAdmin: data.is_admin
    };
  },

  deleteNote: async (id) => {
    const { error } = await supabase
      .from('mading_notes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting mading note:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  }
};
