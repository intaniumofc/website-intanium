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
 * Truncate a text string to a specific length and append an ellipsis.
 * @param {string} text 
 * @param {number} limit 
 * @returns {string}
 */
export const truncateText = (text, limit = 100) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
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
 * Helper to upload or simulate mock upload of standard media files.
 * @param {File} file 
 * @returns {Promise<string>} Uploaded file url path
 */
export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Log admin activity to supabase
 * @param {string} actionText 
 */
export const logAdminActivity = async (actionText) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session && session.user) {
      await supabase.from('admin_activity_logs').insert([
        {
          admin_username: session.user.email,
          action: actionText
        }
      ]);
    }
  } catch (err) {
    console.error('Gagal mencatat log aktivitas:', err);
  }
};
