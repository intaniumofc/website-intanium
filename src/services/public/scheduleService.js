import { supabase } from '../../lib/supabaseClient';

const STATUS_FILTER_COLUMNS_AVAILABLE = new Set();
let columnsAvailabilityChecked = false;

async function detectEventsColumns() {
  if (columnsAvailabilityChecked) return STATUS_FILTER_COLUMNS_AVAILABLE;
  try {
    const probe = await supabase.from('events').select('*').limit(1);
    if (!probe.error && Array.isArray(probe.data) && probe.data[0]) {
      for (const k of Object.keys(probe.data[0])) {
        STATUS_FILTER_COLUMNS_AVAILABLE.add(k);
      }
    }
  } catch (err) {
    console.warn('Tidak dapat memuat kolom events:', err);
  }
  columnsAvailabilityChecked = true;
  return STATUS_FILTER_COLUMNS_AVAILABLE;
}

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=600';

export const scheduleService = {
  getEvents: async (status = 'all', platform = 'All', { includeDrafts = false } = {}) => {
    const cols = await detectEventsColumns();
    let query = supabase.from('events').select('*').order('time', { ascending: false });

    if (cols.has('status') && !includeDrafts) {
      query = query.neq('status', 'draft');
    }

    if (platform !== 'All') {
      if (platform === 'Other Events') {
        query = query.not('platform', 'in', '("Show Theater","Video Call","Birthday")');
      } else {
        query = query.eq('platform', platform);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    let result = data;
    if (status !== 'all') {
      const now = Date.now();
      const twoHoursMs = 2 * 60 * 60 * 1000;
      if (status === 'upcoming') {
        result = result.filter((e) => new Date(e.time).getTime() - now > 0);
      } else if (status === 'completed') {
        result = result.filter((e) => {
          const diff = new Date(e.time).getTime() - now;
          return diff < 0 && Math.abs(diff) > twoHoursMs;
        });
      } else if (status === 'live') {
        result = result.filter((e) => {
          const diff = new Date(e.time).getTime() - now;
          return diff <= 0 && Math.abs(diff) <= twoHoursMs;
        });
      }
    }

    return result;
  },

  createEvent: async (eventData) => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_event', eventData }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
    } catch (err) {
      console.warn('API route schedule create failed, trying client fallback:', err);
    }

    const id = eventData.id || `event-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload = {
      ...eventData,
      id,
      thumbnail:
        (eventData.thumbnail && eventData.thumbnail.trim()) || DEFAULT_THUMBNAIL,
    };
    const { data, error } = await supabase
      .from('events')
      .insert([payload])
      .select()
      .single();
    if (error) {
      console.error('Error creating event:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  updateEvent: async (id, eventData) => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_event', id, eventData }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
    } catch (err) {
      console.warn('API route schedule update failed, trying client fallback:', err);
    }

    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error('Error updating event:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  setEventStatus: async (id, status) => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_status', id, status }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
      if (resData && resData.error) return { success: false, error: resData.error };
    } catch (err) {
      console.warn('API route schedule set_status failed, trying client fallback:', err);
    }

    const { data, error } = await supabase
      .from('events')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) {
      console.error(`Error setting event status to ${status}:`, error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  },

  publishAllDrafts: async () => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_all_drafts' }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
      if (resData && resData.error) return { success: false, error: resData.error };
    } catch (err) {
      console.warn('API route publish_all_drafts failed, trying client fallback:', err);
    }

    const { data, error } = await supabase
      .from('events')
      .update({ status: 'published' })
      .eq('status', 'draft')
      .select();
    if (error) {
      console.error('Error publishing all drafts:', error);
      return { success: false, error: error.message };
    }
    return { success: true, count: data ? data.length : 0 };
  },

  deleteAllDrafts: async () => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_all_drafts' }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
    } catch (err) {
      console.warn('API route delete_all_drafts failed, trying client fallback:', err);
    }

    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('status', 'draft')
      .select();
    if (error) {
      console.error('Error deleting all drafts:', error);
      return { success: false, error: error.message };
    }
    return { success: true, count: data ? data.length : 0 };
  },

  deleteEvent: async (id) => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_event', id }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) return resData;
    } catch (err) {
      console.warn('API route delete_event failed, trying client fallback:', err);
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Error deleting event:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  getBookmarkletToken: async () => {
    try {
      const res = await fetch('/api/admin/schedule/bookmarklet');
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: body.error || `HTTP ${res.status}` };
      }
      return { success: true, data: body };
    } catch (err) {
      console.error('Error calling /api/admin/schedule/bookmarklet:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  // Sync otomatis sisi server: fetch jadwal jkt48.com, deteksi Nur Intan,
  // simpan sebagai draft. fullRange=true untuk sync penuh dari debut.
  syncFromJKT48: async ({ fullRange = false } = {}) => {
    try {
      const res = await fetch('/api/admin/schedule/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullRange }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.success) {
        return { success: false, error: body.error || `HTTP ${res.status}` };
      }
      return { success: true, data: body };
    } catch (err) {
      console.error('Error calling /api/admin/schedule/sync:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
};
