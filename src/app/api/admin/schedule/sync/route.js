import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { fetchIntanSchedulesFromJKT48 } from '@/services/sync/jkt48/scraper';
import { upsertEventsFromJKT48 } from '@/services/sync/jkt48/upsert';
import { createSyncCache } from '@/services/sync/jkt48/cache';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// Sync bisa memakan waktu (fetch list + detail per jadwal ke jkt48.com).
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Rentang sync ringan untuk cron: bulan berjalan + 2 bulan ke depan.
 * (Histori lama sudah tersimpan di DB/cache dari sync sebelumnya.)
 */
function buildRollingWindowOptions() {
  const now = new Date();
  return {
    fullRange: true,
    fromMonth: now.getMonth() + 1,
    fromYear: now.getFullYear(),
    monthsForward: 2,
  };
}

async function runSync(options) {
  const cache = createSyncCache();
  const result = await fetchIntanSchedulesFromJKT48({ ...options, cache });

  let upserted = 0;
  let saved = [];
  if (result.matched.length > 0) {
    const upsertResult = await upsertEventsFromJKT48(result.matched);
    upserted = upsertResult.upserted;
    saved = upsertResult.saved;
  }

  return {
    success: true,
    summary: {
      total: result.total,
      matched: result.matched.length,
      upserted,
      skipped: result.skipped.length,
      failed: result.failed.length,
      fromCache: result.fromCache,
    },
    saved,
    syncedAt: new Date().toISOString(),
    // jkt48.com di balik Cloudflare bisa menolak request server (403).
    // Kalau list kosong total, beri petunjuk fallback ke admin/operator.
    warning: result.total === 0
      ? 'Tidak ada jadwal yang berhasil diambil dari jkt48.com. Server mungkin diblokir Cloudflare — set env JKT48_API_BASE ke proxy/mirror, atau gunakan "Impor via Bookmarklet" di admin panel.'
      : null,
  };
}

function isValidCronSecret(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const headerToken = request.headers.get('x-cron-secret') || '';
  const provided = bearerToken || headerToken;
  if (!provided) return false;

  const providedBuf = Buffer.from(provided);
  const secretBuf = Buffer.from(secret);
  return providedBuf.length === secretBuf.length && crypto.timingSafeEqual(providedBuf, secretBuf);
}

// GET — dipanggil Vercel Cron / GitHub Actions (lihat vercel.json & sync-schedule.yml).
export async function GET(request) {
  if (!isValidCronSecret(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await runSync(buildRollingWindowOptions());
    return NextResponse.json(result);
  } catch (err) {
    console.error('[schedule-sync] Cron sync error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}

// POST — tombol "Sync Sekarang" di admin panel (autentikasi via sesi admin).
export async function POST(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  let body = {};
  try {
    body = await request.json();
  } catch {
    // body opsional
  }

  try {
    // fullRange=true: sync penuh dari debut Intan (berat, jarang diperlukan).
    // Default: rentang ringan bulan berjalan + 2 bulan ke depan.
    const options = body?.fullRange === true ? { fullRange: true } : buildRollingWindowOptions();
    const result = await runSync(options);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[schedule-sync] Manual sync error:', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    );
  }
}
