import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

// GET admin activity logs
export async function GET(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100);

    const supabase = createAdminClient();
    const { data: logs, error } = await supabase
      .from('admin_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching admin activity logs:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error('API admin audit-logs GET error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}

// DELETE a log entry or clear all entries (super_admin only)
export async function DELETE(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  const actorEmail = profile.username || 'admin@intanium.admin';

  // Strictly enforce super_admin IT Support username rule
  if (actorEmail.toLowerCase() !== 'it_support@intanium.admin') {
    return NextResponse.json({ success: false, error: 'Forbidden: Hanya IT Support yang dapat mengelola log aktivitas.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get('id');
    const clearAll = searchParams.get('all') === 'true';

    const supabase = createAdminClient();

    if (clearAll) {
      // Clear all logs
      const { error } = await supabase
        .from('admin_activity_logs')
        .delete()
        .not('id', 'is', null);

      if (error) {
        console.error('Error clearing audit logs:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Re-insert activity logging for the clear action
      await supabase.from('admin_activity_logs').insert([
        {
          admin_username: actorEmail,
          action: 'Membersihkan seluruh log aktivitas admin',
        }
      ]);

      return NextResponse.json({ success: true, clearedAll: true });
    } else {
      if (!logId) {
        return NextResponse.json({ success: false, error: 'id query parameter is required when not clearing all' }, { status: 400 });
      }

      const { error } = await supabase
        .from('admin_activity_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error(`Error deleting audit log ${logId}:`, error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, deletedId: logId });
    }
  } catch (err) {
    console.error('API admin audit-logs DELETE error:', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
