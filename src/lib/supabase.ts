import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gafupfauvyxeecuocezk.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_62RYuL3SYQAyUIqfE5hM5Q_dGjqIA6J';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
