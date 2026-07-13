import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const EXPORTABLE_TABLES = new Set([
  'events',
  'news',
  'recaps',
  'recap_pages',
  'monthly_recaps',
  'gallery',
  'mading_notes',
]);

export async function GET(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.getAll('table').filter(t => EXPORTABLE_TABLES.has(t));
    const tables = requested.length > 0 ? requested : Array.from(EXPORTABLE_TABLES);

    const supabase = createAdminClient();
    const result = {};

    for (const table of tables) {
      let allRows = [];
      let from = 0;
      const BATCH = 1000;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .range(from, from + BATCH - 1);
        if (error) throw new Error(`Table ${table}: ${error.message}`);
        if (!data || data.length === 0) { hasMore = false; break; }
        allRows = allRows.concat(data);
        from += BATCH;
        if (data.length < BATCH) hasMore = false;
      }
      result[table] = allRows;
    }

    const totalRows = Object.values(result).reduce((sum, rows) => sum + rows.length, 0);

    return NextResponse.json(
      { success: true, tables: Object.keys(result), totalRows, data: result },
      {
        headers: {
          'Content-Disposition': 'attachment; filename="iris-backup.json"',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Export error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Export error' }, { status: 500 });
  }
}