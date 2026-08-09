// Service for managing community Fanart submissions via Supabase
import { supabase } from '../../lib/supabaseClient';

export const fanartService = {
  getFanarts: async (status = 'approved') => {
    let query = supabase.from('fanarts').select('*').order('created_at', { ascending: false });
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    if (error) {
      console.error('Error fetching fanarts:', error);
      throw new Error('Gagal mengambil data fanart');
    }
    
    return data || [];
  },

  submitFanart: async (fanartData) => {
    const { error } = await supabase.from('fanarts').insert([
      {
        title: fanartData.title,
        author: fanartData.author,
        description: fanartData.description,
        url: fanartData.url,
        status: 'pending' // default status for public submission
      }
    ]);

    if (error) {
      console.error('Error submitting fanart:', error);
      throw new Error('Terjadi kesalahan saat mengirim fanart');
    }

    return {
      success: true,
      message: 'Karya fanart berhasil dikirim! Saat ini berstatus Pending dan akan tayang setelah ditinjau oleh Admin.',
    };
  },

  updateFanartStatus: async (id, newStatus) => {
    const { error } = await supabase.from('fanarts')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating fanart status:', error);
      return { success: false, error: 'Gagal memperbarui status' };
    }
    
    return { success: true };
  },

  deleteFanart: async (id) => {
    const { error } = await supabase.from('fanarts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting fanart:', error);
      return { success: false, error: 'Gagal menghapus karya' };
    }
    return { success: true };
  }
};
