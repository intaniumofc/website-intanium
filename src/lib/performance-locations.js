import { supabase } from './supabaseClient';

export const INITIAL_SEED_LOCATIONS = [
  {
    id: '1',
    title: 'JKT48 Theater Setlist Cara Meminum Ramune',
    type: 'onair',
    venue_name: 'JKT48 Theater (fX Sudirman)',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    latitude: -6.2255,
    longitude: 106.8024,
    event_date: '2024-03-15',
    end_date: null,
    summary: 'Penampilan rutin Nur Intan dalam Shonichi setlist Cara Meminum Ramune (Ramune no Nomikata) di JKT48 Theater.',
    description: 'Nur Intan tampil sebagai salah satu member reguler membawakan unit song dan keseluruhan rangkaian setlist dengan energi luar biasa.',
    photo_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://jkt48.com'
  },
  {
    id: '2',
    title: 'JKT48 Summer Tour 2024 - Solo',
    type: 'offair',
    venue_name: 'Pakuwon Mall Solo Baru',
    city: 'Sukoharjo',
    province: 'Jawa Tengah',
    latitude: -7.6006,
    longitude: 110.8176,
    event_date: '2024-07-10',
    end_date: '2024-07-10',
    summary: 'Kemunculan offair Nur Intan menyapa para fans di Solo dalam gelaran JKT48 Summer Tour 2024.',
    description: 'Nur Intan berpartisipasi dalam mini concert, meet & greet, serta 2-shot event bersama para penggemar daerah Jawa Tengah.',
    photo_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '3',
    title: 'JKT48 Summer Tour 2024 - Surabaya',
    type: 'offair',
    venue_name: 'Tunjungan Plaza 3',
    city: 'Surabaya',
    province: 'Jawa Timur',
    latitude: -7.2625,
    longitude: 112.7384,
    event_date: '2024-07-12',
    end_date: '2024-07-12',
    summary: 'Rangkaian Summer Tour 2024 di Surabaya yang berlangsung sangat meriah dan dipadati pengunjung.',
    description: 'Special stage performance oleh Nur Intan dan member JKT48 lainnya membawakan lagu-lagu hits utama.',
    photo_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '4',
    title: 'JKT48 Concert In Bandung',
    type: 'offair',
    venue_name: 'Sabuga ITB',
    city: 'Bandung',
    province: 'Jawa Barat',
    latitude: -6.8887,
    longitude: 107.6103,
    event_date: '2024-08-20',
    end_date: '2024-08-20',
    summary: 'Konser spesial offair di Sasana Budaya Ganesa (Sabuga) Bandung.',
    description: 'Penampilan panggung yang spektakuler dengan koreografi memukau dari Nur Intan dan tim.',
    photo_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '5',
    title: 'Festival Kebudayaan Yogyakarta - Special Guest Stage',
    type: 'offair',
    venue_name: 'Taman Budaya Yogyakarta',
    city: 'Yogyakarta',
    province: 'DI Yogyakarta',
    latitude: -7.8009,
    longitude: 110.3672,
    event_date: '2024-09-05',
    end_date: '2024-09-05',
    summary: 'Bintang tamu spesial di ajang seni dan budaya di Yogyakarta.',
    description: 'Nur Intan membawakan lagu-lagu bernuansa energik dan menyapa Wota serta masyarakat Jogja.',
    photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '6',
    title: 'Synchronize Fest 2024 - Jakarta',
    type: 'offair',
    venue_name: 'Gambir Expo Kemayoran',
    city: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    latitude: -6.1475,
    longitude: 106.8432,
    event_date: '2024-10-04',
    end_date: '2024-10-04',
    summary: 'Penampilan panggung festival musik multi-genre terbesar di Indonesia.',
    description: 'Nur Intan tampil memukau di panggung outdoor Synchronize Festival disaksikan ribuan penonton.',
    photo_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '7',
    title: 'JKT48 Special Event Medan',
    type: 'offair',
    venue_name: 'Medan Focal Point',
    city: 'Medan',
    province: 'Sumatera Utara',
    latitude: -3.5852,
    longitude: 98.6366,
    event_date: '2024-11-16',
    end_date: '2024-11-16',
    summary: 'Kunjungan luar pulau Sumatera pertama Nur Intan untuk event sapa fans di Kota Medan.',
    description: 'Acara meliputi Meet & Greet, Talkshow interaktif, dan penyerahan merchandise eksklusif.',
    photo_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '8',
    title: 'JKT48 Special Stage Bali Beach Festival',
    type: 'offair',
    venue_name: 'Pantai Kuta',
    city: 'Badung',
    province: 'Bali',
    latitude: -8.7184,
    longitude: 115.1686,
    event_date: '2024-12-28',
    end_date: '2024-12-28',
    summary: 'Penampilan spesial akhir tahun di panggung tepi pantai Kuta, Bali.',
    description: 'Pentas musik pantai yang hangat dan penuh keceriaan bersama para penggemar Bali dan wisatawan.',
    photo_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  },
  {
    id: '9',
    title: 'JKT48 Meet & Greet Makassar',
    type: 'offair',
    venue_name: 'Trans Studio Mall Makassar',
    city: 'Makassar',
    province: 'Sulawesi Selatan',
    latitude: -5.1601,
    longitude: 119.4046,
    event_date: '2025-02-14',
    end_date: '2025-02-14',
    summary: 'Event Hari Kasih Sayang bersama fans Makassar di Trans Studio Mall.',
    description: 'Nur Intan memberikan pesan hangat dan kesan mendalam bagi para penggemar di Sulawesi Selatan.',
    photo_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000&auto=format&fit=crop',
    source_url: 'https://x.com/iris_ofc'
  }
];

export async function getPerformanceLocations() {
  try {
    const { data, error } = await supabase
      .from('performance_locations')
      .select('*')
      .order('event_date', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Falling back to default performance seed data:', error?.message);
      return INITIAL_SEED_LOCATIONS;
    }

    return data;
  } catch (err) {
    console.error('Error fetching performance locations:', err);
    return INITIAL_SEED_LOCATIONS;
  }
}

export async function createPerformanceLocation(locationData) {
  const { data, error } = await supabase
    .from('performance_locations')
    .insert([locationData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePerformanceLocation(id, locationData) {
  const { data, error } = await supabase
    .from('performance_locations')
    .update({ ...locationData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePerformanceLocation(id) {
  const { error } = await supabase
    .from('performance_locations')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}
