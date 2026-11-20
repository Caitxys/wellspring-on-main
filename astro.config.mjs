// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Runs on Cloudflare Workers. Pages are prerendered (static) by default.
// Add `export const prerender = false` to any page or API route that needs
// the server (sign-in, Supabase queries, form handling).
export default defineConfig({
  adapter: cloudflare({ imageService: 'compile' }),
});
