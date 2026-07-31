// Common utility helper functions
import { supabase } from './supabaseClient';

/**
 * Format number into Indonesian Rupiah (IDR) currency format.
 * @param {number} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Generate a random UUID-like string for local keys or mock IDs.
 * @returns {string}
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

/**
 * Validate an email address.
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Log admin activity to supabase
 * @param {string} actionText 
 */
export const logAdminActivity = async (actionText, details = {}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      const enriched = await supabase.from('admin_activity_logs').insert([
        {
          admin_username: session.user.email,
          action: actionText,
          details: Object.keys(details).length > 0 ? details : null,
        }
      ]);

      if (enriched.error) {
        await supabase.from('admin_activity_logs').insert([
          {
            admin_username: session.user.email,
            action: actionText,
          }
        ]);
      }
    }
  } catch (err) {
    console.error('Gagal mencatat log aktivitas:', err);
  }
};

/**
 * Proxies a Cloudflare R2 URL through Next.js server-side endpoint if it matches *.r2.dev
 * @param {string|string[]} url - The image URL or array of URLs
 * @returns {string|string[]} Proxied URL or array of URLs
 */
export const proxyR2Url = (url) => {
  if (url === null || url === undefined) return url;
  if (Array.isArray(url)) {
    return url.map(u => proxyR2Url(u));
  }
  if (typeof url === 'string') {
    if (!url) return '';
    if (url.startsWith('/api/media')) return url;
    if (url.includes('.r2.dev')) {
      return `/api/media?url=${encodeURIComponent(url)}`;
    }
  }
  return url;
};

/**
 * Optimize an image URL (supports Unsplash resizing and R2 proxying).
 * @param {string} url - The image URL
 * @param {object} options - Optimization options (width, quality)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, { width = 400, quality = 80 } = {}) => {
  if (!url) return '';
  if (typeof url === 'string' && url.startsWith('/api/media')) return url;

  // 1. Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      // Override server-side crop with max to prevent cropping
      urlObj.searchParams.set('fit', 'max');
      if (!urlObj.searchParams.has('auto')) {
        urlObj.searchParams.set('auto', 'format');
      }
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }

  // 2. R2 Optimization & Proxying
  if (url.includes('.r2.dev')) {
    return proxyR2Url(url);
  }

  return url;
};

