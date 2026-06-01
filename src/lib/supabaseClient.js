import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials missing in environmental variables. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY inside your .env file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
