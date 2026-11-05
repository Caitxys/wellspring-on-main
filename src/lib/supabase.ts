import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and add your project URL and anon key.',
  );
}

/** Public client: respects Row Level Security. Safe in pages and API routes. */
export const supabase = createClient(url, anonKey);
