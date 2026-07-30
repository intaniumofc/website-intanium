import { createClient } from '../../utils/supabase/client';
import { FRAMES_CONFIG } from '../../lib/photobooth/frames';

const supabase = createClient();

const DEFAULT_SETTINGS = {
  active: true,
  maintenanceMessage: 'Studio Foto sedang dinonaktifkan sementara. Nantikan event spesial berikutnya!',
  activeEventName: 'Event Spesial JKT48',
  customFrames: []
};

export const photoboothService = {
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('merchandise')
        .select('*')
        .eq('id', 'photobooth_settings')
        .maybeSingle();

      if (error || !data) {
        if (error) console.error('Error fetching photobooth settings:', error);
        return DEFAULT_SETTINGS;
      }

      const settings = JSON.parse(data.description);
      return {
        ...DEFAULT_SETTINGS,
        ...settings,
        customFrames: settings.customFrames || []
      };
    } catch (err) {
      console.error('Error loading photobooth settings:', err);
      return DEFAULT_SETTINGS;
    }
  },

  async getFrames() {
    try {
      const settings = await this.getSettings();
      const customFrames = settings.customFrames || [];
      return [...FRAMES_CONFIG, ...customFrames];
    } catch (err) {
      console.error('Error getting combined photobooth frames:', err);
      return FRAMES_CONFIG;
    }
  },

  async updateSettings(settings) {
    const payload = {
      id: 'photobooth_settings',
      name: 'Photobooth Settings',
      price: 0,
      category: 'Settings',
      description: JSON.stringify(settings),
      is_available: false,
      sizes: []
    };

    const { data, error } = await supabase
      .from('merchandise')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      console.error('Error updating photobooth settings:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  }
};
