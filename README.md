# Wellspring on Main

Website for Wellspring on Main (Arlington's Center for Community Engagement), built with
[Astro](https://astro.build), served by Node (`@astrojs/node`), with a [Supabase](https://supabase.com) database.

## Setup

```powershell
npm install
Copy-Item .env.example .env   # then fill in your Supabase URL and keys
npm run dev                   # http://localhost:4321
```

## Scripts

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the dev server                      |
| `npm run build`   | Build to `./dist/`                        |
| `npm run preview` | Preview the production build              |
| `npm start`       | Run the built Node server (`dist/server`) |

## Supabase

The client lives in `src/lib/supabase.ts`. Import it in any page or API route:

```ts
import { supabase } from '../lib/supabase';
const { data, error } = await supabase.from('your_table').select('*');
```

Pages are static by default. For pages or API routes that should read or write live data,
add `export const prerender = false;` at the top so they run on the Node server.

Never commit `.env` or put the service role key in a `PUBLIC_` variable.

## Project structure

```
src/
  components/   Header, Footer
  layouts/      Base HTML layout
  lib/          Supabase client
  pages/        Routes (index.astro = home page)
  styles/       global.css (design tokens + styles)
```
