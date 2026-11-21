// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Pages are prerendered (static) by default. Add `export const prerender = false`
// to any page or API route that needs to run on the Node server (e.g. Supabase writes).
export default defineConfig({
  adapter: node({ mode: 'standalone' }),
});
