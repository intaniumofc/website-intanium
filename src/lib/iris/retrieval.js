import { createAdminClient } from '../supabase/adminClient.js';
import { extractKeyTerms, normalizeQuery, extractDateFilters } from './intent.js';

/**
 * Retrieve context documents for IRIS Assistant based on user question & detected intent.
 * Supports typos, Indonesian slang, ISO date ranges (e.g. "juli 2026" -> gte 2026-07-01 lte 2026-07-31), and multi-word fallback.
 */
export async function retrieveContext(question, intentObj = {}) {
  const supabase = createAdminClient();
  const docs = [];
  const cleanQ = (question || '').trim();
  const keyTerms = intentObj.keyword || extractKeyTerms(cleanQ);
  const dateFilter = intentObj.dateFilter || extractDateFilters(cleanQ);

  // 1. Date Range Query Handling (e.g. "juli 2026" -> 2026-07-01 to 2026-07-31)
  if (dateFilter && dateFilter.startDate && dateFilter.endDate) {
    try {
      const [eventsRes, perfRes] = await Promise.all([
        supabase
          .from('events')
          .select('*')
          .gte('time', dateFilter.startDate)
          .lte('time', dateFilter.endDate)
          .limit(10),
        supabase
          .from('performance_locations')
          .select('*')
          .gte('event_date', dateFilter.perfStartDate)
          .lte('event_date', dateFilter.perfEndDate)
          .limit(10),
      ]);

      if (eventsRes.data) {
        for (const item of eventsRes.data) {
          if (!docs.some((d) => d.id === String(item.id))) {
            let formattedDate = item.time;
            try {
              formattedDate = item.time
                ? new Date(item.time).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                : '';
            } catch (e) {}

            docs.push({
              id: String(item.id),
              source_table: 'events',
              title: item.title,
              snippet: `Tanggal Show/Event: ${formattedDate || item.time} | Platform/Venue: ${item.platform || 'Theater'}`,
              url: item.link || '/schedule',
            });
          }
        }
      }

      if (perfRes.data) {
        for (const item of perfRes.data) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'performance_locations',
              title: item.title,
              snippet: `Tanggal Event: ${item.event_date || ''} | Lokasi: ${item.city} - ${item.venue_name}`,
              url: `/peta-penampilan?id=${item.id}`,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Date range retrieval error:', err);
    }
  }

  // 2. Stats Snapshot Context
  if (intentObj.intent === 'SEARCH_STATS' || /berapa|total|banyak|jumlah|show|event/i.test(cleanQ)) {
    try {
      const { data: statsData } = await supabase
        .from('statistics_snapshot')
        .select('*')
        .eq('id', 1)
        .single();

      if (statsData && !docs.some((d) => d.id === 'stats-snapshot-1')) {
        docs.push({
          id: 'stats-snapshot-1',
          source_table: 'statistics_snapshot',
          title: 'Statistik Penampilan & Pencapaian Nur Intan',
          snippet: `Total Penampilan Show Teater: ${statsData.theater_count || 0}, Total Event Offair: ${statsData.offair_count || 0}, Total Kota Dikunjungi: ${statsData.city_count || 0}, Total Provinsi: ${statsData.province_count || 0}, Total Pencapaian Milestone: ${statsData.achievement_count || 0}, Kota Paling Sering Dikunjungi: ${statsData.most_visited_city || 'N/A'}.`,
          url: '/peta-penampilan',
        });
      }
    } catch (e) {
      console.warn('Could not fetch statistics_snapshot:', e);
    }
  }

  // 2.5 Intent-driven direct table context retrieval
  if (intentObj.intent === 'SEARCH_MERCHANDISE') {
    try {
      const { data: merchData } = await supabase
        .from('merchandise')
        .select('*')
        .neq('id', 'payment_settings')
        .neq('id', 'game_settings')
        .limit(6);
      if (merchData) {
        for (const item of merchData) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'merchandise',
              title: item.name || 'Merchandise IRIS',
              snippet: `Produk: ${item.name} | Kategori: ${item.category || 'Merch'} | Harga: Rp ${(item.price || 0).toLocaleString('id-ID')} | Stok: ${item.stock ?? 'Tersedia'} | Deskripsi: ${item.description || ''}`,
              url: `/merchandise/${item.id}`,
            });
          }
        }
      }
    } catch (e) {}
  }

  if (intentObj.intent === 'SEARCH_ESPORT') {
    try {
      const { data: esportData } = await supabase.from('esport_divisions').select('*').limit(5);
      if (esportData) {
        for (const item of esportData) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'esport_divisions',
              title: `Divisi Esports IRIS: ${item.name || item.game_title}`,
              snippet: `Game: ${item.game_title || item.name} | Deskripsi: ${item.description || 'Divisi Esports IRIS'}`,
              url: '/esport',
            });
          }
        }
      }
    } catch (e) {}
  }

  if (intentObj.intent === 'SEARCH_PLAYLIST') {
    try {
      const { data: playlistData } = await supabase.from('playlists').select('*').limit(5);
      if (playlistData) {
        for (const item of playlistData) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'playlists',
              title: item.title || '#dengerINTAN Playlist',
              snippet: `Playlist: ${item.title} | Kategori: ${item.category || 'Musik'} | Catatan Kurator: ${item.curator_note || item.description || ''}`,
              url: '/denger-intan',
            });
          }
        }
      }
    } catch (e) {}
  }

  if (intentObj.intent === 'SEARCH_FANART') {
    try {
      const { data: fanartData } = await supabase.from('fanart').select('*').limit(5);
      if (fanartData) {
        for (const item of fanartData) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'fanart',
              title: item.title || 'Fanart Nur Intan',
              snippet: `Karya Seni: ${item.title} | Kreator: ${item.artist_name || 'Fans'} | Caption: ${item.caption || ''}`,
              url: '/fanart',
            });
          }
        }
      }
    } catch (e) {}
  }

  if (intentObj.intent === 'SEARCH_RECAP') {
    try {
      const { data: recapData } = await supabase.from('recaps').select('*').limit(5);
      if (recapData) {
        for (const item of recapData) {
          if (!docs.some((d) => d.id === String(item.id))) {
            docs.push({
              id: String(item.id),
              source_table: 'recaps',
              title: item.title || 'Recap Pertunjukan',
              snippet: `Recap: ${item.title} | Tanggal: ${item.publish_date || ''} | Summary: ${item.summary || item.content || ''}`,
              url: `/recaps/${item.id}`,
            });
          }
        }
      }
    } catch (e) {}
  }

  // 3. RPC search_all with extracted key terms
  const searchTargets = [keyTerms, normalizeQuery(cleanQ)].filter(Boolean);

  for (const target of searchTargets) {
    try {
      const { data: rpcData } = await supabase.rpc('search_all', { query_text: target });

      if (Array.isArray(rpcData) && rpcData.length > 0) {
        for (const item of rpcData) {
          if (!docs.some((d) => d.id === item.id && d.source_table === item.source_table)) {
            docs.push({
              id: item.id,
              source_table: item.source_table,
              title: item.title,
              snippet: item.snippet,
              rank: item.rank,
              url: item.url,
            });
          }
        }
      }
    } catch (err) {
      console.warn('RPC search_all failed:', err.message);
    }
  }

  // 4. Multi-word individual token fallback across all public database tables
  const tokens = keyTerms.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length > 0) {
    try {
      for (const token of tokens) {
        const [
          perf, events, news, trivia,
          merch, fanart, esport, recaps,
          playlists, achieve, comic, frames
        ] = await Promise.allSettled([
          supabase.from('performance_locations').select('*').or(`title.ilike.%${token}%,city.ilike.%${token}%,summary.ilike.%${token}%`).limit(3),
          supabase.from('events').select('*').or(`title.ilike.%${token}%,description.ilike.%${token}%`).limit(3),
          supabase.from('news').select('*').or(`title.ilike.%${token}%,summary.ilike.%${token}%`).limit(3),
          supabase.from('intan_trivia').select('*').or(`question.ilike.%${token}%,answer.ilike.%${token}%`).limit(3),
          supabase.from('merchandise').select('*').or(`name.ilike.%${token}%,category.ilike.%${token}%,description.ilike.%${token}%`).neq('id', 'payment_settings').neq('id', 'game_settings').limit(3),
          supabase.from('fanart').select('*').or(`title.ilike.%${token}%,artist_name.ilike.%${token}%,caption.ilike.%${token}%`).limit(3),
          supabase.from('esport_divisions').select('*').or(`name.ilike.%${token}%,game_title.ilike.%${token}%,description.ilike.%${token}%`).limit(3),
          supabase.from('recaps').select('*').or(`title.ilike.%${token}%,summary.ilike.%${token}%,content.ilike.%${token}%`).limit(3),
          supabase.from('playlists').select('*').or(`title.ilike.%${token}%,description.ilike.%${token}%,category.ilike.%${token}%`).limit(3),
          supabase.from('intan_shining_star_achievements').select('*').or(`title.ilike.%${token}%,description.ilike.%${token}%,category.ilike.%${token}%`).limit(3),
          supabase.from('intan_shining_star_comic_pages').select('*').or(`chapter_title.ilike.%${token}%,caption.ilike.%${token}%`).limit(3),
          supabase.from('photobooth_frames').select('*').or(`name.ilike.%${token}%,description.ilike.%${token}%`).limit(3),
        ]);

        if (perf.status === 'fulfilled' && perf.value.data) {
          for (const item of perf.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'performance_locations',
                title: item.title,
                snippet: item.summary || item.description || `${item.city} - ${item.venue_name}`,
                url: `/peta-penampilan?id=${item.id}`,
              });
            }
          }
        }

        if (events.status === 'fulfilled' && events.value.data) {
          for (const item of events.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'events',
                title: item.title,
                snippet: item.description || `${item.platform || 'Teater'} - ${item.duration || ''}`,
                url: item.link || '/schedule',
              });
            }
          }
        }

        if (news.status === 'fulfilled' && news.value.data) {
          for (const item of news.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'news',
                title: item.title,
                snippet: item.summary || item.content,
                url: `/news/${item.id}`,
              });
            }
          }
        }

        if (trivia.status === 'fulfilled' && trivia.value.data) {
          for (const item of trivia.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'intan_trivia',
                title: item.question,
                snippet: item.answer,
                url: '/about-intan',
              });
            }
          }
        }

        if (merch.status === 'fulfilled' && merch.value.data) {
          for (const item of merch.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'merchandise',
                title: item.name || 'Merchandise IRIS',
                snippet: `Produk: ${item.name} | Kategori: ${item.category || 'Merch'} | Harga: Rp ${(item.price || 0).toLocaleString('id-ID')} | Stok: ${item.stock ?? 'Tersedia'} | Deskripsi: ${item.description || item.name}`,
                url: `/merchandise/${item.id}`,
              });
            }
          }
        }

        if (fanart.status === 'fulfilled' && fanart.value.data) {
          for (const item of fanart.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'fanart',
                title: item.title || 'Fanart Nur Intan',
                snippet: `Karya Oleh: ${item.artist_name || 'Fans'} | Keterangan: ${item.caption || item.title}`,
                url: '/fanart',
              });
            }
          }
        }

        if (esport.status === 'fulfilled' && esport.value.data) {
          for (const item of esport.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'esport_divisions',
                title: item.name || 'Divisi Esports IRIS',
                snippet: `Game: ${item.game_title || item.name} | Deskripsi: ${item.description || 'Divisi Esports IRIS'}`,
                url: '/esport',
              });
            }
          }
        }

        if (recaps.status === 'fulfilled' && recaps.value.data) {
          for (const item of recaps.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'recaps',
                title: item.title || 'Recap Pertunjukan',
                snippet: item.summary || item.content || item.title,
                url: `/recaps/${item.id}`,
              });
            }
          }
        }

        if (playlists.status === 'fulfilled' && playlists.value.data) {
          for (const item of playlists.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'playlists',
                title: item.title || '#dengerINTAN Playlist',
                snippet: `Kategori: ${item.category || 'Playlist'} | Deskripsi: ${item.description || item.curator_note || item.title}`,
                url: '/denger-intan',
              });
            }
          }
        }

        if (achieve.status === 'fulfilled' && achieve.value.data) {
          for (const item of achieve.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'intan_shining_star_achievements',
                title: item.title || 'Milestone Intan',
                snippet: `Kategori: ${item.category || 'Milestone'} | Tanggal: ${item.date || ''} | Deskripsi: ${item.description || item.title}`,
                url: '/milestone',
              });
            }
          }
        }

        if (comic.status === 'fulfilled' && comic.value.data) {
          for (const item of comic.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'intan_shining_star_comic_pages',
                title: item.chapter_title ? `Komik Intan: ${item.chapter_title}` : `Komik Intan Halaman ${item.page_number}`,
                snippet: `Halaman ${item.page_number || 1}: ${item.caption || item.chapter_title || 'Komik Perjalanan Intan'}`,
                url: '/milestone',
              });
            }
          }
        }

        if (frames.status === 'fulfilled' && frames.value.data) {
          for (const item of frames.value.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'photobooth_frames',
                title: item.name || 'Bingkai Photobooth Intan',
                snippet: item.description || `Frame foto virtual bertema Nur Intan`,
                url: '/photobooth',
              });
            }
          }
        }
      }
    } catch (e) {
      console.warn('Token fallback error:', e);
    }
  }

  // 5. Ambient Baseline Fallback: If still 0 docs, append statistics_snapshot so baseline stats are available
  if (docs.length === 0) {
    try {
      const { data: statsData } = await supabase
        .from('statistics_snapshot')
        .select('*')
        .eq('id', 1)
        .single();

      if (statsData) {
        docs.push({
          id: 'stats-snapshot-1',
          source_table: 'statistics_snapshot',
          title: 'Statistik Penampilan & Pencapaian Nur Intan',
          snippet: `Total Show Teater: ${statsData.theater_count || 0}, Event Offair: ${statsData.offair_count || 0}, Total Kota: ${statsData.city_count || 0}, Total Provinsi: ${statsData.province_count || 0}, Total Pencapaian: ${statsData.achievement_count || 0}.`,
          url: '/peta-penampilan',
        });
      }
    } catch (e) {}
  }

  return docs.slice(0, 10);
}
