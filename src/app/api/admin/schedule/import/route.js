import { NextResponse } from 'next/server';
import { classifyImportedSchedules } from '@/services/sync/jkt48/scraper';
import { upsertEventsFromJKT48 } from '@/services/sync/jkt48/upsert';
import { createSyncCache } from '@/services/sync/jkt48/cache';
import { verifyImportToken } from '@/services/sync/jkt48/importToken';

// This endpoint is called by the browser bookmarklet running on the jkt48.com
// origin (which passes Cloudflare), so it must support cross-origin requests.
// Auth is via a signed token in the body/query (cookies are not sent cross-site).
function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, { status = 200, origin } = {}) {
  return NextResponse.json(data, { status, headers: corsHeaders(origin) });
}

export async function OPTIONS(request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
}

// GET ?action=resolved&token=... -> links already resolved & in the past, so
// the browser can skip re-fetching their detail on repeat runs.
export async function GET(request) {
  const origin = request.headers.get('origin');
  const token = request.nextUrl.searchParams.get('token') || '';
  const check = verifyImportToken(token);
  if (!check.valid) {
    return json({ success: false, error: `Unauthorized: ${check.reason}` }, { status: 401, origin });
  }

  try {
    const cache = createSyncCache();
    const all = await cache.getAllResolved();
    const now = Date.now();
    const resolvedLinks = all
      .filter((r) => r.detail_ok && r.event_time && new Date(r.event_time).getTime() < now)
      .map((r) => r.link);
    return json({ success: true, resolvedLinks }, { origin });
  } catch (err) {
    console.error('Error in GET /api/admin/schedule/import:', err);
    return json({ success: false, error: 'Internal error' }, { status: 500, origin });
  }
}

// POST { token, entries: [{ list, detail, skippedDetail }], onlyIntan }
export async function POST(request) {
  const origin = request.headers.get('origin');
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, { status: 400, origin });
  }

  const check = verifyImportToken(body?.token);
  if (!check.valid) {
    return json({ success: false, error: `Unauthorized: ${check.reason}` }, { status: 401, origin });
  }

  const entries = Array.isArray(body?.entries) ? body.entries : [];
  const onlyIntan = body?.onlyIntan !== false;

  try {
    // Entries the browser deliberately skipped (already resolved & in DB).
    const fresh = entries.filter((e) => !e.skippedDetail);
    const fromCache = entries.length - fresh.length;

    const { matched, skipped, failed, cacheEntries } = classifyImportedSchedules(fresh, { onlyIntan });

    let upserted = 0;
    let saved = [];
    if (matched.length > 0) {
      const result = await upsertEventsFromJKT48(matched);
      upserted = result.upserted;
      saved = result.saved;
    }

    const cache = createSyncCache();
    if (cacheEntries.length) await cache.save(cacheEntries);

    return json({
      success: true,
      summary: {
        total: entries.length,
        processed: fresh.length,
        matched: matched.length,
        upserted,
        skipped: skipped.length,
        failed: failed.length,
        fromCache,
      },
      saved,
    }, { origin });
  } catch (err) {
    console.error('Error in POST /api/admin/schedule/import:', err);
    return json({ success: false, error: err instanceof Error ? err.message : 'Internal error' }, { status: 500, origin });
  }
}
