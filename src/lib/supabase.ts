import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env and add your project URL and anon key.',
  );
}

/**
 * Creates a Supabase client for ONE server request.
 *
 * It reads the signed-in user's session from cookies, so every query runs
 * as that user and Row Level Security applies. The anon key is the public
 * key; no secret key is needed or used anywhere in this app.
 */
export function createSupabase(request: Request, cookies: AstroCookies) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '').map(({ name, value }) => ({
          name,
          value: value ?? '',
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, options);
        }
      },
    },
  });
}
