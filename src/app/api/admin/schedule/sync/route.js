import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { fetchIntanSchedulesFromJKT48 } from '@/services/sync/jkt48/scraper';
import { upsertEventsFromJKT48 } from '@/services/sync/jkt48/upsert';

export async function POST(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const start = Date.now();
    const { matched, skipped, total } = await fetchIntanSchedulesFromJKT48();
    let upserted = 0;
    let saved = [];
    if (matched.length > 0) {
      const result = await upsertEventsFromJKT48(matched);
      upserted = result.upserted;
      saved = result.saved;
    }
    const elapsed = Date.now() - start;

    return NextResponse.json({
      success: true,
      total: total,
      matched: matched.length,
      skipped: skipped,
      upserted,
      saved,
      elapsed,
    });
  } catch (err) {
    console.error('Error in POST /api/admin/schedule/sync:', err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Terjadi kesalahan internal saat sinkronisasi.',
    }, { status: 500 });
  }
}

export async function GET(request) {
  const authHeader = request.headers.get('authorization') || '';
  const cronSecret = request.headers.get('x-cron-secret') || authHeader.replace(/^Bearer\s+/i, '');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'CRON_SECRET belum dikonfigurasi di server.' },
      { status: 500 }
    );
  }
  if (cronSecret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: invalid or missing x-cron-secret header.' },
      { status: 401 }
    );
  }

  try {
    const start = Date.now();
    const { matched, skipped, total } = await fetchIntanSchedulesFromJKT48();
    let upserted = 0;
    let saved = [];
    if (matched.length > 0) {
      const result = await upsertEventsFromJKT48(matched);
      upserted = result.upserted;
      saved = result.saved;
    }
    const elapsed = Date.now() - start;

    return NextResponse.json({
      success: true,
      trigger: 'cron',
      total,
      matched: matched.length,
      skipped,
      upserted,
      saved,
      elapsed,
    });
  } catch (err) {
    console.error('Error in cron GET /api/admin/schedule/sync:', err);
    return NextResponse.json(
      { success: false, trigger: 'cron', error: err instanceof Error ? err.message : 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}