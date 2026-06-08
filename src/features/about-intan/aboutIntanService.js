import { supabase } from '../../lib/supabaseClient';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '../../lib/youtube';

// ==========================================
// STATIC BIO DATA (tidak perlu masuk database)
// ==========================================
const STATIC_BIO = {
  fullName: 'Nur Intan',
  nickname: 'Intan / Dik Nuy',
  dateOfBirth: '23 Februari 2006',
  zodiac: 'Pisces',
  height: '157 cm',
  bloodType: 'B',
  origin: 'Bogor, Jawa Barat',
  generation: 'Generasi 13 (Trainee)',
  description: 'Intan permata yang berkilau, temukan cahayaku di hatimu!',
  socialStats: [
    { label: 'Instagram Followers', value: '@intan.jkt48', icon: '📸' },
    { label: 'Twitter / X', value: '@N_IntanJKT48', icon: '💬' },
    { label: 'TikTok Followers', value: '@jkt48.intan', icon: '📱' },
    { label: 'Showroom Room', value: 'Intan JKT48', icon: '📺' },
  ],
};

// ==========================================
// FALLBACK DATA (jika Supabase gagal)
// ==========================================
const FALLBACK_STATS = [
  { label: 'Total Show Teater', value: '128+ Show', icon: 'Theater', description: 'Jumlah penampilan resmi di Teater JKT48' },
  { label: 'Total Live Showroom', value: '256+ Live', icon: 'Radio', description: 'Siaran langsung menyapa penggemar secara interaktif' },
  { label: 'Partisipasi Setlist', value: '3 Setlist', icon: 'ListMusic', description: 'Setlist panggung teater yang aktif dikuasai' },
  { label: 'Total Event / Konser', value: '8+ Event', icon: 'Mic2', description: 'Penampilan di konser anniversary, regional tour, & festival' }
];

const FALLBACK_SETLISTS = [
  {
    id: 'setlist-1', name: 'Aitakatta', period: 'Desember 2024 - Sekarang', shows: '45+ Shows',
    theme: 'aitakatta', image: '/setlistaitakatta.webp',
    unitSongs: ['Nageki no Figure (Boneka yang Menyedihkan)', 'Glass no I Love You (Kaca Berbentuk I Love You)', 'Senaka Kara Dakishimete (Dekap Aku dari Belakang)', 'Koi no Plan (Rencana Cinta)']
  },
  {
    id: 'setlist-2', name: 'Pajama Drive', period: 'Desember 2024 - Sekarang', shows: '38+ Shows',
    theme: 'pajama', image: '/setlistpajamadrive.webp',
    unitSongs: ['Tenshi no Shippo (Ekor Malaikat)', 'Pajama Drive', 'Temodemo no Namida']
  },
  {
    id: 'setlist-3', name: 'Kira-kira Girls', period: '2025 - Sekarang', shows: '12+ Shows',
    theme: 'kirakira', image: '/setlistkirakiragirls.webp',
    unitSongs: ['Blue Rose', 'Kinjirareta Futari (Dua Orang yang Terlarang)', 'Faint']
  }
];

const FALLBACK_VIDEOS = [
  { id: 'vid-1', title: 'JKT48 13th Generation Profile: Intan', youtubeId: 'SojGpGHMYEA', category: 'Profile', duration: '03:45', thumbnail: 'https://img.youtube.com/vi/SojGpGHMYEA/mqdefault.jpg' },
  { id: 'vid-2', title: 'Belajar Konseling bersama Intan', youtubeId: 'nZL7vtku_o4', category: 'Vlog', duration: '11:24', thumbnail: 'https://img.youtube.com/vi/nZL7vtku_o4/mqdefault.jpg' },
  { id: 'vid-3', title: '[JAHAT-JAHATAN] SPESIAL DIRGAHAYU RI KE-80!', youtubeId: 'ek8xyzdx0NI', category: 'Jahat-Jahatan', duration: '15:40', thumbnail: 'https://img.youtube.com/vi/ek8xyzdx0NI/mqdefault.jpg' },
  { id: 'vid-4', title: '[LAST CONTENT] GRACIA VS ADIK-ADIK', youtubeId: '1p-0wQB-5M8', category: 'Last Content', duration: '18:12', thumbnail: 'https://img.youtube.com/vi/1p-0wQB-5M8/mqdefault.jpg' },
  { id: 'vid-5', title: 'TEMEN MAIN EP.4: THE FINAL GAME ON! - Intan vs Trisha', youtubeId: 'HRA-zTDD4Ek', category: 'Temen Main', duration: '14:50', thumbnail: 'https://img.youtube.com/vi/HRA-zTDD4Ek/mqdefault.jpg' },
  { id: 'vid-6', title: '[SECRET CAM] Personal Meet & Greet: LOVE DREAM PASSION', youtubeId: '8j_SX3BgWVc', category: 'Secret Cam', duration: '08:12', thumbnail: 'https://img.youtube.com/vi/8j_SX3BgWVc/mqdefault.jpg' }
];

const FALLBACK_TRIVIA = [
  { question: 'Siapa member tertua di JKT48 Generasi 13?', answer: 'Intan merupakan member tertua di JKT48 Generasi 13 (Trainee).' },
  { question: 'Apa makanan favorit Nur Intan?', answer: 'Sangat menyukai hidangan pedas seperti seblak, bakso aci, dan camilan rasa cokelat manis.' },
  { question: 'Apa saja hobi dan minat Intan di luar JKT48?', answer: 'Menari (dance cover), mendengarkan lagu pop/K-Pop (terutama GFRIEND), membaca komik, dan fotografi.' },
  { question: 'Apakah Intan memiliki ketakutan atau fobia tertentu?', answer: 'Sangat takut terhadap serangga kecil bersayap yang terbang tak teratur, khususnya kecoa terbang.' },
  { question: 'Apa saja prestasi Intan di bidang bela diri dan tari sebelum masuk JKT48?', answer: 'Sebelum bergabung dengan JKT48, Intan merupakan atlet pencak silat berprestasi dan penari aktif. Mewakili Perguruan Silat Sabda Sunda, ia berhasil meraih Juara 1 di ajang Pusaka Sunda Cup se-Jabodetabek pada 10 Juli 2022. Ia juga mengikuti kompetisi "DBL Dance Competition 2023 - West Java Series West Region" dan masuk nominasi "DBL Favorite Dancer 2023" mewakili SMA Negeri 3 Bogor.' },
  { question: 'Di mana Intan menempuh pendidikan perguruan tinggi?', answer: 'Saat ini, Intan sedang menempuh pendidikan jenjang Diploma 3 (D3) program studi Periklanan Kreatif, Program Pendidikan Vokasi di Universitas Indonesia (UI) Depok, angkatan 2024. Sebelum bergabung dengan JKT48, ia sering melakukan dance cover lagu JKT48 bersama teman-teman kuliahnya.' },
  { question: 'Apakah Intan pernah muncul di video YouTube JKT48 sebelum resmi bergabung?', answer: 'Ya! Pada 11 Maret 2025, Intan mengungkapkan lewat akun X resminya bahwa ia pernah berpartisipasi dalam video YouTube "JKT48 Dance Class for Kids" yang diunggah pada 10 Februari 2016 saat ia masih berusia 9 tahun. Menariknya, Diva (Generasi 2 KLP48) juga ikut tampil dalam acara yang sama kala itu.' },
  { question: 'Bagaimana kisah perjuangan dan kegagalan Intan saat mengikuti audisi JKT48?', answer: 'Perjalanan Intan tidaklah instan; ia sempat gagal di dua audisi JKT48 dan satu audisi KLP48. Ia awalnya ingin mendaftar JKT48 Generasi 10 pada 2020 tapi diurungkan karena belum siap. Kemudian ia mendaftar Generasi 11 pada 2022 namun gagal di berkas. Pada 2023, formulir pendaftaran Generasi 12 miliknya gagal terkirim. Ia juga mencoba peruntungan di KLP48 Generasi 1 pada awal 2024 namun belum berhasil, sebelum akhirnya resmi lolos di JKT48 Generasi 13 di akhir 2024.' },
  { question: 'Apa penyesalan terbesar Intan sebelum resmi terpilih sebagai member?', answer: 'Sebelum resmi terpilih menjadi member, Intan mengaku menyesal karena belum pernah mencoba mendaftar untuk menonton pertunjukan langsung di Teater JKT48 sebagai fans.' },
  { question: 'Kapan penampilan perdana Intan sebagai backdancer di Teater JKT48?', answer: 'Penampilan perdana Intan sebagai backdancer (BD) di Teater JKT48 terjadi pada 19 Oktober 2025 membawakan lagu "Glory Days" pada JKT48 5th Stage (Glory).' },
  { question: 'Apa quote motivasi yang menjadi prinsip bagi Intan?', answer: '"Seperti permata yang tersembunyi, aku akan terus berlatih dan mengasah kemampuanku agar bisa bersinar terang di hatimu!"' }
];

// ==========================================
// PUBLIC API: getBio() — Gabungan static + dynamic
// ==========================================
export const aboutIntanService = {
  getBio: async () => {
    // Fetch all dynamic data from Supabase in parallel
    const [statsRes, setlistsRes, videosRes, triviaRes] = await Promise.all([
      supabase.from('intan_stats').select('*').order('sort_order'),
      supabase.from('intan_setlists').select('*, intan_unit_songs(*)').eq('status', 'Aktif').order('sort_order'),
      supabase.from('intan_videos').select('*').order('sort_order'),
      supabase.from('intan_trivia').select('*').order('sort_order'),
    ]);

    // Stats: map or fallback
    if (statsRes.error) console.error('Error fetching public intan_stats:', statsRes.error);
    if (setlistsRes.error) console.error('Error fetching public intan_setlists:', setlistsRes.error);
    if (videosRes.error) console.error('Error fetching public intan_videos:', videosRes.error);
    if (triviaRes.error) console.error('Error fetching public intan_trivia:', triviaRes.error);

    const stats = statsRes.error
      ? FALLBACK_STATS
      : statsRes.data.map(s => ({ label: s.label, value: s.value, icon: s.icon, description: s.description }));

    // Setlists: map with unit songs, or fallback
    const setlistsAndUnitSongs = setlistsRes.error
      ? FALLBACK_SETLISTS
      : setlistsRes.data.map(s => ({
          id: s.id,
          name: s.name,
          period: s.period,
          shows: s.shows,
          theme: s.theme,
          image: s.image_url,
          unitSongs: (s.intan_unit_songs || [])
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map(u => u.song_name)
        }));

    // Videos: map with thumbnail auto-generation, or fallback
    const videos = videosRes.error
      ? FALLBACK_VIDEOS
      : videosRes.data.map(v => ({
          id: v.id,
          title: v.title,
          youtubeId: v.youtube_id,
          category: v.category,
          duration: v.duration,
          thumbnail: getYouTubeThumbnailUrl(v.youtube_id)
        }));

    // Trivia: map or fallback
    const triviaDetails = triviaRes.error
      ? FALLBACK_TRIVIA
      : triviaRes.data.map(t => ({ question: t.question, answer: t.answer }));

    return {
      ...STATIC_BIO,
      stats,
      setlistsAndUnitSongs,
      videos,
      triviaDetails,
    };
  },

  // ==========================================
  // STATS CRUD
  // ==========================================
  getStats: async () => {
    const { data, error } = await supabase.from('intan_stats').select('*').order('sort_order');
    if (error) { console.error('Error fetching intan_stats:', error); return []; }
    return data;
  },

  createStat: async (statData) => {
    const id = statData.id || `stat-${Date.now()}`;
    const payload = {
      id,
      label: statData.label,
      value: statData.value,
      icon: statData.icon,
      description: statData.description,
      sort_order: statData.sort_order,
    };
    const { data, error } = await supabase
      .from('intan_stats')
      .insert([payload])
      .select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  updateStat: async (id, statData) => {
    const { data, error } = await supabase
      .from('intan_stats')
      .update({ label: statData.label, value: statData.value, icon: statData.icon, description: statData.description, sort_order: statData.sort_order })
      .eq('id', id).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  deleteStat: async (id) => {
    const { error } = await supabase.from('intan_stats').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ==========================================
  // SETLISTS CRUD
  // ==========================================
  getSetlists: async () => {
    const { data, error } = await supabase
      .from('intan_setlists')
      .select('*, intan_unit_songs(*)')
      .order('sort_order');
    if (error) { console.error('Error fetching intan_setlists:', error); return []; }
    return data.map(s => ({
      ...s,
      unitSongs: (s.intan_unit_songs || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    }));
  },

  createSetlist: async (setlistData) => {
    const id = setlistData.id || `setlist-${Date.now()}`;
    const { unitSongs, ...rest } = setlistData;
    const payload = {
      id,
      name: rest.name,
      period: rest.period,
      shows: rest.shows,
      theme: rest.theme,
      image_url: rest.image_url,
      status: rest.status,
      note: rest.note,
      sort_order: rest.sort_order,
    };
    const { data, error } = await supabase
      .from('intan_setlists')
      .insert([payload])
      .select().single();
    if (error) return { success: false, error: error.message };

    // Insert unit songs if provided
    if (unitSongs && unitSongs.length > 0) {
      const songs = unitSongs.map((name, i) => ({ setlist_id: id, song_name: name, sort_order: i + 1 }));
      const { error: songsError } = await supabase.from('intan_unit_songs').insert(songs);
      if (songsError) {
        await supabase.from('intan_setlists').delete().eq('id', id);
        return { success: false, error: `Setlist gagal disimpan lengkap: ${songsError.message}` };
      }
    }
    return { success: true, data };
  },

  updateSetlist: async (id, setlistData) => {
    const { unitSongs, ...rest } = setlistData;
    const { data, error } = await supabase
      .from('intan_setlists')
      .update({ name: rest.name, period: rest.period, shows: rest.shows, theme: rest.theme, image_url: rest.image_url, status: rest.status, note: rest.note, sort_order: rest.sort_order })
      .eq('id', id).select().single();
    if (error) return { success: false, error: error.message };

    // Replace unit songs: delete old, insert new
    if (unitSongs) {
      const { data: oldSongs, error: oldSongsError } = await supabase
        .from('intan_unit_songs')
        .select('song_name, sort_order')
        .eq('setlist_id', id);
      if (oldSongsError) return { success: false, error: oldSongsError.message };

      const { error: deleteSongsError } = await supabase.from('intan_unit_songs').delete().eq('setlist_id', id);
      if (deleteSongsError) return { success: false, error: deleteSongsError.message };

      if (unitSongs.length > 0) {
        const songs = unitSongs.map((name, i) => ({ setlist_id: id, song_name: name, sort_order: i + 1 }));
        const { error: songsError } = await supabase.from('intan_unit_songs').insert(songs);
        if (songsError) {
          if (oldSongs?.length) {
            await supabase.from('intan_unit_songs').insert(oldSongs.map(song => ({ ...song, setlist_id: id })));
          }
          return { success: false, error: `Unit songs gagal diperbarui: ${songsError.message}` };
        }
      }
    }
    return { success: true, data };
  },

  deleteSetlist: async (id) => {
    // Unit songs cascade-deleted automatically
    const { error } = await supabase.from('intan_setlists').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ==========================================
  // VIDEOS CRUD
  // ==========================================
  getVideos: async () => {
    const { data, error } = await supabase.from('intan_videos').select('*').order('sort_order');
    if (error) { console.error('Error fetching intan_videos:', error); return []; }
    return data;
  },

  createVideo: async (videoData) => {
    const id = videoData.id || `vid-${Date.now()}`;
    const youtubeId = extractYouTubeVideoId(videoData.youtube_id);
    if (!youtubeId) return { success: false, error: 'Link atau ID YouTube tidak valid.' };
    const payload = {
      id,
      title: videoData.title,
      youtube_id: youtubeId,
      category: videoData.category,
      duration: videoData.duration,
      sort_order: videoData.sort_order,
    };
    const { data, error } = await supabase
      .from('intan_videos')
      .insert([payload])
      .select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  updateVideo: async (id, videoData) => {
    const youtubeId = extractYouTubeVideoId(videoData.youtube_id);
    if (!youtubeId) return { success: false, error: 'Link atau ID YouTube tidak valid.' };
    const { data, error } = await supabase
      .from('intan_videos')
      .update({ title: videoData.title, youtube_id: youtubeId, category: videoData.category, duration: videoData.duration, sort_order: videoData.sort_order })
      .eq('id', id).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  deleteVideo: async (id) => {
    const { error } = await supabase.from('intan_videos').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },

  // ==========================================
  // TRIVIA CRUD
  // ==========================================
  getTrivia: async () => {
    const { data, error } = await supabase.from('intan_trivia').select('*').order('sort_order');
    if (error) { console.error('Error fetching intan_trivia:', error); return []; }
    return data;
  },

  createTrivia: async (triviaData) => {
    const { data, error } = await supabase
      .from('intan_trivia')
      .insert([triviaData])
      .select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  updateTrivia: async (id, triviaData) => {
    const { data, error } = await supabase
      .from('intan_trivia')
      .update({ question: triviaData.question, answer: triviaData.answer, sort_order: triviaData.sort_order })
      .eq('id', id).select().single();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },

  deleteTrivia: async (id) => {
    const { error } = await supabase.from('intan_trivia').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
};
