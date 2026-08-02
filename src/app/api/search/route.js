import { createAdminClient } from '../../../lib/supabase/adminClient.js';

export async function GET(request) {
  const startTime = performance.now();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || searchParams.get('query') || '';

  const cleanQuery = query.trim();

  if (!cleanQuery) {
    return Response.json({
      success: true,
      query: '',
      results: [],
      total: 0,
      latency_ms: Math.round(performance.now() - startTime),
    });
  }

  try {
    const supabase = createAdminClient();

    // 1. Primary Method: RPC call to PostgreSQL function search_all(query_text)
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('search_all', { query_text: cleanQuery });

    if (!rpcError && Array.isArray(rpcData)) {
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      return Response.json({
        success: true,
        query: cleanQuery,
        results: rpcData,
        total: rpcData.length,
        latency_ms: latencyMs,
        source: 'rpc_search_all',
      });
    }

    // 2. Fallback Method: Parallel queries across existing tables if RPC search_all is not yet migrated in DB
    console.warn('RPC search_all not available or errored, executing JS fallback query:', rpcError?.message);

    const [perfRes, eventsRes, galleryRes, achieveRes, triviaRes, newsRes] = await Promise.allSettled([
      supabase
        .from('performance_locations')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,city.ilike.%${cleanQuery}%,venue_name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(10),
      supabase
        .from('events')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(10),
      supabase
        .from('gallery')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
        .limit(10),
      supabase
        .from('intan_shining_star_achievements')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`)
        .limit(10),
      supabase
        .from('intan_trivia')
        .select('*')
        .or(`question.ilike.%${cleanQuery}%,answer.ilike.%${cleanQuery}%`)
        .limit(10),
      supabase
        .from('news')
        .select('*')
        .or(`title.ilike.%${cleanQuery}%,summary.ilike.%${cleanQuery}%,content.ilike.%${cleanQuery}%`)
        .limit(10),
    ]);

    const results = [];

    if (perfRes.status === 'fulfilled' && Array.isArray(perfRes.value.data)) {
      for (const item of perfRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'performance_locations',
          title: item.title,
          snippet: item.summary || item.description || `${item.city} - ${item.venue_name}`,
          rank: item.city?.toLowerCase().includes(cleanQuery.toLowerCase()) ? 0.9 : 0.6,
          url: `/performance-map?id=${item.id}`,
        });
      }
    }

    if (eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value.data)) {
      for (const item of eventsRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'events',
          title: item.title,
          snippet: item.description || `${item.platform} - ${item.duration || ''}`,
          rank: 0.5,
          url: item.link || '/schedule',
        });
      }
    }

    if (galleryRes.status === 'fulfilled' && Array.isArray(galleryRes.value.data)) {
      for (const item of galleryRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'gallery',
          title: item.title,
          snippet: item.description || item.title,
          rank: 0.4,
          url: item.url,
        });
      }
    }

    if (achieveRes.status === 'fulfilled' && Array.isArray(achieveRes.value.data)) {
      for (const item of achieveRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'intan_shining_star_achievements',
          title: item.title,
          snippet: item.description || item.category,
          rank: 0.5,
          url: '/intan-shining-star',
        });
      }
    }

    if (triviaRes.status === 'fulfilled' && Array.isArray(triviaRes.value.data)) {
      for (const item of triviaRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'intan_trivia',
          title: item.question,
          snippet: item.answer,
          rank: 0.7,
          url: '/about-intan',
        });
      }
    }

    if (newsRes.status === 'fulfilled' && Array.isArray(newsRes.value.data)) {
      for (const item of newsRes.value.data) {
        results.push({
          id: String(item.id),
          source_table: 'news',
          title: item.title,
          snippet: item.summary || item.content,
          rank: 0.5,
          url: `/news/${item.id}`,
        });
      }
    }

    results.sort((a, b) => b.rank - a.rank);

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    return Response.json({
      success: true,
      query: cleanQuery,
      results,
      total: results.length,
      latency_ms: latencyMs,
      source: 'js_fallback',
    });
  } catch (error) {
    console.error('Error in /api/search route:', error);
    return Response.json(
      {
        success: false,
        error: error.message || 'Internal Server Error',
        latency_ms: Math.round(performance.now() - startTime),
      },
      { status: 500 }
    );
  }
}
