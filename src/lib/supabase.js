import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to your .env.local file or Vercel settings.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
