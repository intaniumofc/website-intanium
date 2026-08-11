import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/adminClient';
import { requireAdmin } from '@/lib/auth/requireAdmin';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600';

export async function POST(request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { action } = body;
    const supabase = createAdminClient();

    if (action === 'set_status') {
      const { id, status } = body;
      if (!id || !status) {
        return NextResponse.json({ success: false, error: 'ID dan status wajib diisi' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event status via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (action === 'publish_all_drafts') {
      const { data, error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('status', 'draft')
        .select();

      if (error) {
        console.error('Error publishing all drafts via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, count: data ? data.length : 0, data });
    }

    if (action === 'delete_all_drafts') {
      const { data, error } = await supabase
        .from('events')
        .delete()
        .eq('status', 'draft')
        .select();

      if (error) {
        console.error('Error deleting all drafts via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, count: data ? data.length : 0 });
    }

    if (action === 'create_event') {
      const { eventData } = body;
      if (!eventData) {
        return NextResponse.json({ success: false, error: 'Data event tidak boleh kosong' }, { status: 400 });
      }
      const id = eventData.id || `event-${Math.floor(100000 + Math.random() * 900000)}`;
      const payload = {
        ...eventData,
        id,
        thumbnail: (eventData.thumbnail && eventData.thumbnail.trim()) || 
          (eventData.platform === 'Video Call' ? '/videocall.webp' : DEFAULT_THUMBNAIL),
      };
      const { data, error } = await supabase
        .from('events')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('Error creating event via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (action === 'update_event') {
      const { id, eventData } = body;
      if (!id || !eventData) {
        return NextResponse.json({ success: false, error: 'ID dan eventData wajib diisi' }, { status: 400 });
      }
      const { data, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating event via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (action === 'delete_event') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
      }
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        console.error('Error deleting event via admin API:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Action tidak valid' }, { status: 400 });
  } catch (err) {
    console.error('Error in admin schedule API route:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
