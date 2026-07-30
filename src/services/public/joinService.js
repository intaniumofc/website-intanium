import { supabase } from '../../lib/supabaseClient';

const DEFAULT_SETTINGS = {
  member: {
    id: 'member',
    type: 'member',
    title: 'Open Member IRIS',
    description: 'Mari bergabung menjadi bagian dari keanggotaan resmi IRIS untuk bersama-sama mendukung Nur Intan JKT48.',
    status: 'open',
    updated_at: new Date().toISOString(),
  },
  admin: {
    id: 'admin',
    type: 'admin',
    title: 'Recruitment Admin IRIS',
    description: 'Tertarik berkontribusi mengelola fanbase? Kami membuka rekrutmen pengurus untuk berbagai divisi internal.',
    status: 'open',
    available_positions: [
      'Data Archiver',
      'Keanggotaan dan Lapangan',
      'Video Editor',
      'Media Sosial',
      'Design Grafis',
      'Illustrator',
      'E-Sport Management',
      'Merchandise'
    ],
    updated_at: new Date().toISOString(),
  },
  volunteer: {
    id: 'volunteer',
    type: 'volunteer',
    title: 'Open Volunteer Event & Kegiatan',
    description: 'Mari berpartisipasi sebagai relawan dalam kegiatan kebersamaan, event perayaan, dan aksi sosial IRIS.',
    status: 'open',
    available_divisions: [
      'Divisi Acara',
      'Divisi Konsumsi',
      'Divisi Sarana & Prasarana',
      'Divisi Dokumentasi & Media'
    ],
    updated_at: new Date().toISOString(),
  },
};

const STORAGE_KEY_SETTINGS = 'iris_join_settings';
const STORAGE_KEY_SUBMISSIONS = 'iris_join_submissions';

function getLocalSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveLocalSettings(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving local join settings:', err);
  }
}

function getLocalSubmissions() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(submissions) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
  } catch (err) {
    console.error('Error saving local join submissions:', err);
  }
}

export const joinService = {
  // Get settings for member, admin, volunteer forms
  async getJoinSettings() {
    try {
      const { data, error } = await supabase.from('join_settings').select('*');
      if (error || !data || data.length === 0) {
        return getLocalSettings();
      }
      const map = { ...getLocalSettings() };
      data.forEach((item) => {
        if (item.id) map[item.id] = item;
      });
      return map;
    } catch {
      return getLocalSettings();
    }
  },

  // Update form settings (open/closed, title, description)
  async updateJoinSettings(type, updates) {
    const current = await this.getJoinSettings();
    const updatedTypeSetting = { ...current[type], ...updates, updated_at: new Date().toISOString() };
    const allUpdated = { ...current, [type]: updatedTypeSetting };

    saveLocalSettings(allUpdated);

    try {
      await supabase.from('join_settings').upsert({
        id: type,
        type,
        ...updatedTypeSetting,
      });
    } catch (err) {
      console.warn('Supabase sync join_settings skipped:', err);
    }

    return allUpdated;
  },

  // Submit a new join application
  async submitJoinApplication(payload) {
    const newRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...payload,
    };

    const localList = getLocalSubmissions();
    localList.unshift(newRecord);
    saveLocalSubmissions(localList);

    try {
      const { data, error } = await supabase.from('join_submissions').insert([newRecord]).select();
      if (!error && data && data[0]) {
        return data[0];
      }
    } catch (err) {
      console.warn('Supabase insert join_submissions skipped, fallback local saved:', err);
    }

    return newRecord;
  },

  // Get all submissions for admin panel
  async getJoinSubmissions() {
    try {
      const { data, error } = await supabase
        .from('join_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch join_submissions error, using local fallback:', err);
    }

    return getLocalSubmissions();
  },

  // Update submission status (e.g. pending -> approved / rejected / contacted)
  async updateSubmissionStatus(id, newStatus, notes = '') {
    const localList = getLocalSubmissions();
    const updated = localList.map((item) => (item.id === id ? { ...item, status: newStatus, notes } : item));
    saveLocalSubmissions(updated);

    try {
      await supabase.from('join_submissions').update({ status: newStatus, notes }).eq('id', id);
    } catch (err) {
      console.warn('Supabase update submission status skipped:', err);
    }

    return updated;
  },

  // Delete submission
  async deleteSubmission(id) {
    const localList = getLocalSubmissions();
    const filtered = localList.filter((item) => item.id !== id);
    saveLocalSubmissions(filtered);

    try {
      await supabase.from('join_submissions').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete submission skipped:', err);
    }

    return filtered;
  },
};
