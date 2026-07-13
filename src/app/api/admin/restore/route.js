import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  const actorEmail = profile.username || 'admin@iris.admin';

  // Strict role check: only IT Support / super_admin is allowed to restore
  if (actorEmail.toLowerCase() !== 'it_support@iris.admin') {
    return NextResponse.json(
      { success: false, error: 'Forbidden: Hanya IT Support yang dapat melakukan restore data.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json({ success: false, error: 'Invalid backup format: data field is missing' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // urutan tabel saat didelete (tabel anak/dependen harus didelete pertama)
    const deleteOrder = [
      'recap_pages',
      'monthly_recaps',
      'recaps',
      'events',
      'news',
      'gallery',
      'mading_notes'
    ];

    // urutan tabel saat diinsert (tabel induk harus diinsert pertama)
    const insertOrder = [
      'recaps',
      'recap_pages',
      'monthly_recaps',
      'events',
      'news',
      'gallery',
      'mading_notes'
    ];

    // 1. Delete all records from specified tables
    for (const table of deleteOrder) {
      const { error } = await supabase
        .from(table)
        .delete()
        .not('id', 'is', null);

      if (error) {
        console.error(`Error deleting table ${table} during restore:`, error);
        throw new Error(`Gagal mengosongkan tabel ${table}: ${error.message}`);
      }
    }

    // 2. Insert records back
    let restoredCounts = {};
    for (const table of insertOrder) {
      const rows = data[table];
      if (Array.isArray(rows) && rows.length > 0) {
        // Bulk insert
        const { error } = await supabase
          .from(table)
          .insert(rows);

        if (error) {
          console.error(`Error inserting table ${table} during restore:`, error);
          throw new Error(`Gagal memulihkan data tabel ${table}: ${error.message}`);
        }
        restoredCounts[table] = rows.length;
      } else {
        restoredCounts[table] = 0;
      }
    }

    // 3. Log restore activity
    const totalRestored = Object.values(restoredCounts).reduce((sum, count) => sum + count, 0);
    await supabase.from('admin_activity_logs').insert([
      {
        admin_username: actorEmail,
        action: `Melakukan restore data dari JSON cadangan. Total baris dipulihkan: ${totalRestored}`,
      }
    ]);

    return NextResponse.json({
      success: true,
      restoredCounts,
      totalRestored
    });

  } catch (err) {
    console.error('API admin restore POST error:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
