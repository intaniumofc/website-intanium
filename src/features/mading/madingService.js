import { supabase } from '../../lib/supabaseClient';
import { generateId } from '../../lib/helpers';

export const madingService = {
  getNotes: async (onlyApproved = true) => {
    let query = supabase
      .from('mading_notes')
      .select('*');
      
    if (onlyApproved) {
      query = query.eq('is_approved', true);
    }
      
    const { data, error } = await query.order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching mading notes:', error);
      return [];
    }
    return data.map(note => ({
      ...note,
      themeColor: note.theme_color,
      createdAt: note.created_at,
      isAdmin: note.is_admin,
      isApproved: note.is_approved
    }));
  },

  postNote: async (noteData) => {
    const newNote = {
      id: generateId(),
      name: noteData.name || 'Anonim',
      message: noteData.message,
      theme_color: noteData.themeColor || 'yellow',
      is_admin: false,
      is_approved: false // requires admin moderation approval
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
      isAdmin: data.is_admin,
      isApproved: data.is_approved
    };
  },

  approveNote: async (id) => {
    const { error } = await supabase
      .from('mading_notes')
      .update({ is_approved: true })
      .eq('id', id);
      
    if (error) {
      console.error('Error approving note:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  unapproveNote: async (id) => {
    const { error } = await supabase
      .from('mading_notes')
      .update({ is_approved: false })
      .eq('id', id);
      
    if (error) {
      console.error('Error unapproving note:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
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
