import { supabase } from '../../lib/supabaseClient';

// Fallback Mock Data matching seed.sql
const MOCK_PLAYLISTS = [
  {
    id: '2aMGqrDZrqERqgMPIQe0ui',
    title: 'Ongoing New Playlist',
    description: 'Kumpulan lagu pilihan terbaru untuk menemani hari-harimu di #DengerINTAN.',
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    category: 'Juni 2026',
    badgeText: 'Ongoing Playlist',
    duration: '2h 00m',
    tracksCount: '30 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/2aMGqrDZrqERqgMPIQe0ui',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/2aMGqrDZrqERqgMPIQe0ui?utm_source=generator',
    curatorNote: 'Hai Intanium! Ini playlist Ongoing terbaru khusus buat nemenin aktivitas kalian bulan ini. Selamat mendengarkan! ✨',
    createdAt: new Date().toISOString()
  },
  {
    id: '4jLqcyPlFe7hdFFOr1r0ML',
    title: 'Archive Playlist Vol. 3',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    category: 'Mei 2026',
    badgeText: 'Archive Playlist',
    duration: '1h 45m',
    tracksCount: '25 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/4jLqcyPlFe7hdFFOr1r0ML',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/4jLqcyPlFe7hdFFOr1r0ML?utm_source=generator',
    curatorNote: 'Halo semuanya! Ini adalah arsip playlist bulan lalu. Tetap asyik buat didengerin ulang sambil santai atau nugas kok! 🎧',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6azVHz2MOw9d0oJrZxmpul',
    title: 'Archive Playlist Vol. 2',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=600&auto=format&fit=crop',
    category: 'April 2026',
    badgeText: 'Archive Playlist',
    duration: '2h 15m',
    tracksCount: '35 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/6azVHz2MOw9d0oJrZxmpul',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/6azVHz2MOw9d0oJrZxmpul?utm_source=generator',
    curatorNote: 'Kumpulan lagu penuh memori dari kurasi edisi lalu. Jangan lupa cek track favorit kalian di sini ya! 🎸',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '1zpGEcM4GlAyz4kpvjJUK9',
    title: 'Archive Playlist Vol. 1',
    description: 'Arsip keseruan dan memori lagu-lagu pilihan dari edisi #DengerINTAN sebelumnya.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    category: 'Maret 2026',
    badgeText: 'Archive Playlist',
    duration: '1h 30m',
    tracksCount: '20 Tracks',
    embedUrl: 'https://www.youtube.com/embed/videoseries?list=PL3-sRM8xAzY-oQj01w4_mY6-x6H2bE3X1',
    spotifyUrl: 'https://open.spotify.com/playlist/1zpGEcM4GlAyz4kpvjJUK9',
    spotifyEmbedUrl: 'https://open.spotify.com/embed/playlist/1zpGEcM4GlAyz4kpvjJUK9?utm_source=generator',
    curatorNote: 'Kilas balik ke playlist awal #DengerINTAN. Isinya lagu-lagu nostalgic yang bakal bikin kamu ikutan sing-along! 🎤☀️',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const playlistService = {
  getPlaylists: async () => {
    // If Supabase URL is missing or placeholder, fallback immediately
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return MOCK_PLAYLISTS;
    }

    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching playlists, falling back to mock:', error);
        return MOCK_PLAYLISTS;
      }

      if (data && data.length > 0) {
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
      return MOCK_PLAYLISTS;
    } catch (err) {
      console.error('Failed to get playlists, falling back to mock:', err);
      return MOCK_PLAYLISTS;
    }
  },

  createPlaylist: async (playlistData) => {
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
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
    ) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('most_played_songs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching most played songs, falling back to mock:', error);
        return [];
      }

      if (data && data.length > 0) {
        return data.map(s => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          playCount: s.play_count,
          mood: s.mood || '',
          note: s.note || '',
          audioUrl: s.audio_url || '',
          coverUrl: s.cover_url || '',
          createdAt: s.created_at
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to get most played songs, falling back to mock:', err);
      return [];
    }
  },

  createMostPlayedSong: async (songData) => {
    const { data, error } = await supabase
      .from('most_played_songs')
      .insert([{
        title: songData.title,
        artist: songData.artist,
        play_count: songData.playCount,
        mood: songData.mood || '',
        note: songData.note || '',
        audio_url: songData.audioUrl || '',
        cover_url: songData.coverUrl || ''
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
        note: songData.note || '',
        audio_url: songData.audioUrl || '',
        cover_url: songData.coverUrl || ''
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
