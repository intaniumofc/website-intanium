import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function PUT(request) {
  const { profile, error: authError } = await requireAdmin();
  if (authError) return authError;

  if (profile.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Forbidden: Hanya super admin yang dapat mengubah profil staff.' }, { status: 403 });
  }

  try {
    const { id, role, permissions, division_id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing admin ID' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('admin_profiles')
      .update({ role, permissions, division_id })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('API admin profile update error:', err);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal server' }, { status: 500 });
  }
}
