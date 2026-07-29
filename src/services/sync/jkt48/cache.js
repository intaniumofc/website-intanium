import 'server-only';
import { createAdminClient } from '@/lib/supabase/adminClient';

/**
 * Build a Supabase-backed cache adapter for the JKT48 sync.
 * Gracefully degrades (returns empty Map, logs warn) if the table doesn't
 * exist yet so sync still works before the migration is run.
 */
export function createSyncCache() {
  return {
    /**
     * @param {string[]} links
     * @returns {Promise<Map<string, {is_intan: boolean, detail_ok: boolean, event_time: string|null}>>}
     */
    async getResolved(links) {
      if (!links.length) return new Map();
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('jkt48_sync_cache')
          .select('link, is_intan, detail_ok, event_time')
          .in('link', links);
        if (error) {
          console.warn('[sync-cache] getResolved error (table may not exist yet):', error.message);
          return new Map();
        }
        return new Map((data || []).map((r) => [r.link, r]));
      } catch (err) {
        console.warn('[sync-cache] getResolved exception:', err?.message || err);
        return new Map();
      }
    },

    /**
     * Return every resolved link (used by the browser bookmarklet to skip
     * re-fetching detail for past shows already stored).
     * @returns {Promise<Array<{link: string, is_intan: boolean, detail_ok: boolean, event_time: string|null}>>}
     */
    async getAllResolved() {
      try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
          .from('jkt48_sync_cache')
          .select('link, is_intan, detail_ok, event_time');
        if (error) {
          console.warn('[sync-cache] getAllResolved error (table may not exist yet):', error.message);
          return [];
        }
        return data || [];
      } catch (err) {
        console.warn('[sync-cache] getAllResolved exception:', err?.message || err);
        return [];
      }
    },

    /**
     * @param {Array<{link: string, is_intan: boolean, detail_ok: boolean, title?: string, platform?: string, event_time?: string|null}>} entries
     */
    async save(entries) {
      if (!entries.length) return;
      try {
        const supabase = createAdminClient();
        const rows = entries.map((e) => ({
          link: e.link,
          is_intan: Boolean(e.is_intan),
          detail_ok: Boolean(e.detail_ok),
          title: e.title || null,
          platform: e.platform || null,
          event_time: e.event_time || null,
          checked_at: new Date().toISOString(),
        }));
        const { error } = await supabase
          .from('jkt48_sync_cache')
          .upsert(rows, { onConflict: 'link' });
        if (error) {
          console.warn('[sync-cache] save error (table may not exist yet):', error.message);
        }
      } catch (err) {
        console.warn('[sync-cache] save exception:', err?.message || err);
      }
    },
  };
}
