import { supabase } from '../../lib/supabaseClient';

export const playlistService = {
  getPlaylists: async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching playlists:', error);
      return [];
    }

    if (data) {
      return data.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || '',
        imageUrl: p.image_url || '',
        category: p.category,
        badgeText: p.badge_text || '',
        duration: p.duration || '',
        tracksCount: p.tracks_count || '',
        embedUrl: p.embed_url || '',
        spotifyUrl: p.spotify_url,
        spotifyEmbedUrl: p.spotify_embed_url,
        curatorNote: p.curator_note || '',
        createdAt: p.created_at
      }));
    }
    return [];
  },

  createPlaylist: async (playlistData) => {
    // Generate id if not provided
    const id = playlistData.id || `playlist-${Math.floor(100000 + Math.random() * 900000)}`;
    const { data, error } = await supabase
      .from('playlists')
      .insert([{
        id,
        title: playlistData.title,
        description: playlistData.description || '',
        image_url: playlistData.imageUrl || playlistData.image_url || '',
        category: playlistData.category,
        badge_text: playlistData.badgeText || playlistData.badge_text || '',
        duration: playlistData.duration || '',
        tracks_count: playlistData.tracksCount || playlistData.tracks_count || '',
        embed_url: playlistData.embedUrl || playlistData.embed_url || '',
        spotify_url: playlistData.spotifyUrl,
        spotify_embed_url: playlistData.spotifyEmbedUrl,
        curator_note: playlistData.curatorNote || playlistData.curator_note || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating playlist:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updatePlaylist: async (id, playlistData) => {
    const { data, error } = await supabase
      .from('playlists')
      .update({
        title: playlistData.title,
        description: playlistData.description || '',
        image_url: playlistData.imageUrl || playlistData.image_url || '',
        category: playlistData.category,
        badge_text: playlistData.badgeText || playlistData.badge_text || '',
        duration: playlistData.duration || '',
        tracks_count: playlistData.tracksCount || playlistData.tracks_count || '',
        embed_url: playlistData.embedUrl || playlistData.embed_url || '',
        spotify_url: playlistData.spotifyUrl,
        spotify_embed_url: playlistData.spotifyEmbedUrl,
        curator_note: playlistData.curatorNote || playlistData.curator_note || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating playlist:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deletePlaylist: async (id) => {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting playlist:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  getMostPlayedSongs: async () => {
    const { data, error } = await supabase
      .from('most_played_songs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching most played songs:', error);
      return [];
    }

    if (data) {
      return data.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        playCount: s.play_count,
        mood: s.mood || '',
        note: s.note || '',
        createdAt: s.created_at
      }));
    }
    return [];
  },

  createMostPlayedSong: async (songData) => {
    const { data, error } = await supabase
      .from('most_played_songs')
      .insert([{
        title: songData.title,
        artist: songData.artist,
        play_count: songData.playCount,
        mood: songData.mood || '',
        note: songData.note || ''
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating most played song:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateMostPlayedSong: async (id, songData) => {
    const { data, error } = await supabase
      .from('most_played_songs')
      .update({
        title: songData.title,
        artist: songData.artist,
        play_count: songData.playCount,
        mood: songData.mood || '',
        note: songData.note || ''
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating most played song:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  deleteMostPlayedSong: async (id) => {
    const { error } = await supabase
      .from('most_played_songs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting most played song:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }
};
