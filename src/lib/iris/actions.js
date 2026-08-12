import { z } from 'zod';
import { createAdminClient } from '../supabase/adminClient.js';

// Whitelist of allowed navigation paths (Strict Security Requirement #1)
export const ALLOWED_NAVIGATE_PATHS = [
  '/',
  '/about-intan',
  '/about-iris',
  '/denger-intan',
  '/esport',
  '/fanart',
  '/gallery',
  '/games',
  '/games/menangkap-kecoa',
  '/games/gosok-intan',
  '/join',
  '/mading',
  '/merchandise',
  '/milestone',
  '/shining-star',
  '/news',
  '/peta-penampilan',
  '/photobooth',
  '/recaps',
  '/schedule',
];

// Discriminated Union Zod Schema for Actions (Plan Section 5)
export const ActionSchema = z.discriminatedUnion('name', [
  z.object({
    name: z.literal('zoomMap'),
    city: z.string().min(1).max(100),
    zoomLevel: z.number().optional(),
  }),
  z.object({
    name: z.literal('openGallery'),
    eventId: z.string().min(1).max(100),
  }),
  z.object({
    name: z.literal('applyFilter'),
    filterType: z.string().min(1).max(50),
    filterValue: z.string().min(1).max(100),
  }),
  z.object({
    name: z.literal('navigate'),
    path: z.string().min(1).max(200),
  }),
  z.object({
    name: z.literal('highlightTimeline'),
    entryId: z.string().min(1).max(100),
  }),
]);

/**
 * Server-Side Strict Action Validation BEFORE sending action to frontend for execution
 */
export async function validateAction(action) {
  try {
    // 1. Zod Schema parse
    const parsed = ActionSchema.safeParse(action);
    if (!parsed.success) {
      return { valid: false, reason: `Zod validation failed: ${parsed.error.message}` };
    }

    const val = parsed.data;
    const supabase = createAdminClient();

    // 2. Strict Whitelist for `navigate`
    if (val.name === 'navigate') {
      const cleanPath = val.path.split('?')[0].split('#')[0].toLowerCase().trim();
      const isAllowed = ALLOWED_NAVIGATE_PATHS.includes(cleanPath);
      if (!isAllowed) {
        return { valid: false, reason: `Path "${val.path}" tidak ada dalam whitelist navigasi` };
      }
      return { valid: true, action: val };
    }

    // 3. Validation for `zoomMap.city` against real DB performance_locations
    if (val.name === 'zoomMap') {
      const cleanCity = val.city.trim();
      const { data } = await supabase
        .from('performance_locations')
        .select('city')
        .ilike('city', `%${cleanCity}%`)
        .limit(1);

      if (!data || data.length === 0) {
        return { valid: false, reason: `Kota "${val.city}" tidak ada di database performance_locations` };
      }
      return { valid: true, action: { ...val, city: data[0].city } };
    }

    // 4. Validation for `openGallery.eventId`
    if (val.name === 'openGallery') {
      const { data: galData } = await supabase
        .from('gallery')
        .select('id')
        .eq('id', val.eventId)
        .limit(1);

      const { data: eventData } = await supabase
        .from('events')
        .select('id')
        .eq('id', val.eventId)
        .limit(1);

      if ((!galData || galData.length === 0) && (!eventData || eventData.length === 0)) {
        return { valid: false, reason: `Event ID "${val.eventId}" tidak ditemukan di database` };
      }
      return { valid: true, action: val };
    }

    // 5. Validation for `highlightTimeline.entryId`
    if (val.name === 'highlightTimeline') {
      const { data } = await supabase
        .from('intan_shining_star_achievements')
        .select('id')
        .eq('id', val.entryId)
        .limit(1);

      if (!data || data.length === 0) {
        return { valid: false, reason: `Timeline Entry ID "${val.entryId}" tidak ditemukan di database` };
      }
      return { valid: true, action: val };
    }

    // 6. Validation for `applyFilter`
    if (val.name === 'applyFilter') {
      const allowedFilterTypes = ['city', 'category', 'type', 'display_type'];
      if (!allowedFilterTypes.includes(val.filterType.toLowerCase())) {
        return { valid: false, reason: `Filter type "${val.filterType}" tidak diizinkan` };
      }
      return { valid: true, action: val };
    }

    return { valid: false, reason: 'Action tidak dikenal' };
  } catch (err) {
    return { valid: false, reason: `Exception: ${err.message}` };
  }
}
