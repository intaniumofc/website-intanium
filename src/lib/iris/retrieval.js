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

  // 3. RPC search_all with extracted key terms (e.g. "show juli 2026" or "juli 2026")
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

  // 4. Multi-word individual token fallback (Handles typos & partial word matches)
  const tokens = keyTerms.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length > 0) {
    try {
      for (const token of tokens) {
        const [perf, events, news, trivia] = await Promise.all([
          supabase
            .from('performance_locations')
            .select('*')
            .or(`title.ilike.%${token}%,city.ilike.%${token}%,summary.ilike.%${token}%`)
            .limit(3),
          supabase
            .from('events')
            .select('*')
            .or(`title.ilike.%${token}%,description.ilike.%${token}%`)
            .limit(3),
          supabase
            .from('news')
            .select('*')
            .or(`title.ilike.%${token}%,summary.ilike.%${token}%`)
            .limit(3),
          supabase
            .from('intan_trivia')
            .select('*')
            .or(`question.ilike.%${token}%,answer.ilike.%${token}%`)
            .limit(3),
        ]);

        if (perf.data) {
          for (const item of perf.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'performance_locations',
                title: item.title,
                snippet: item.summary || item.description || `${item.city} - ${item.venue_name}`,
                url: `/performance-map?id=${item.id}`,
              });
            }
          }
        }

        if (events.data) {
          for (const item of events.data) {
            if (!docs.some((d) => d.id === String(item.id))) {
              docs.push({
                id: String(item.id),
                source_table: 'events',
                title: item.title,
                snippet: item.description || `${item.platform} - ${item.duration || ''}`,
                url: item.link || '/schedule',
              });
            }
          }
        }

        if (news.data) {
          for (const item of news.data) {
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

        if (trivia.data) {
          for (const item of trivia.data) {
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
          url: '/performance-map',
        });
      }
    } catch (e) {}
  }

  return docs.slice(0, 10);
}
