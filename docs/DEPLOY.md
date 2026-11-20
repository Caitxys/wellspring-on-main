# Putting the Site Online with Cloudflare

This guide connects the GitHub repository to Cloudflare, so the site goes live on the internet and updates itself every time someone pushes to `main`. You don't need a programming background; it's all done in two dashboards.

**How it works:** Cloudflare watches the GitHub repository. When new code reaches `main`, Cloudflare downloads it, builds the site (`npm run build`), and publishes it (`npx wrangler deploy`). The site runs on **Cloudflare Workers**, Cloudflare's service for running website code.

---

## What's already set up in the code

| File | What it does |
|---|---|
| `astro.config.mjs` | Tells Astro to build for Cloudflare (the `@astrojs/cloudflare` adapter) |
| `wrangler.jsonc` | Cloudflare's settings: the project name (`wellspring-on-main`) and where the built files are |
| `public/.assetsignore` | Keeps the server code private, so it isn't served as a downloadable file |
| `package.json` | `npm run preview` runs the built site locally the way Cloudflare does; `npm run deploy` publishes it by hand |

Local development is unchanged: `npm run dev`, then http://localhost:4321.

---

## Before you start

- A **Cloudflare account** (free plan is fine).
- **Admin access to the GitHub repository**, or the repository owner available to approve. Connecting a repository installs Cloudflare's GitHub app on it, which only the owner or an admin can approve.
- The **Supabase project URL** and **publishable key** (the same two values as in `.env`).

---

## Step 1: Create the project in Cloudflare

1. Sign in at https://dash.cloudflare.com.
2. In the left menu, open **Compute (Workers) → Workers & Pages**.
3. Click **Create** (or **Create application**), then choose **Import a repository** under Workers.
4. Click **Connect GitHub** (the first time only). GitHub opens and asks which repositories Cloudflare may see. Choose **Only select repositories → wellspring-on-main**, then **Install & Authorize**.
   - If you aren't the owner, GitHub sends the owner a request instead. They must approve it before you can continue.
5. Back in Cloudflare, pick the **wellspring-on-main** repository.

## Step 2: Build settings

Cloudflare fills most of these in. Check that they match:

| Setting | Value |
|---|---|
| Project name | `wellspring-on-main` (must match `name` in `wrangler.jsonc`) |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | leave blank (`/`) |

## Step 3: Add the Supabase settings (important)

The site reads the Supabase address and key **while it is being built**, so they must be **build variables**. Adding them only as runtime variables isn't enough.

1. Still on the setup screen (or later under **Settings → Build → Variables and secrets**), add:

| Variable name | Value |
|---|---|
| `PUBLIC_SUPABASE_URL` | your project URL, e.g. `https://abcdefghijklmnop.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | your **publishable** key (starts with `sb_publishable_`) |

2. Click **Deploy**.

> ⚠️ Never add the service-role / secret key. The site doesn't use it.
>
> `.env` should **not** be in GitHub. Cloudflare gets these values from the variables above, not from that file.

## Step 4: Check the live site

When the build finishes, Cloudflare shows the address, something like `https://wellspring-on-main.<your-subdomain>.workers.dev`.

1. Open `<that address>/login` and sign in as a test account.
2. Run the role check from [SIGN-IN-README.md](SIGN-IN-README.md) Part 6 in the browser console. You should get the same 401 / 403 / 200 results as on your computer.

From now on, every push or merge to `main` publishes a new version automatically. Pushes to other branches get their own **preview** address, so you can check a change before it goes live. Find them under the project's **Deployments** tab.

---

## Troubleshooting

| What you see | What it means | Fix |
|---|---|---|
| Build log: `Missing Supabase env vars` | The two variables weren't available during the build | Add them under **Settings → Build → Variables and secrets** (not only under runtime variables), then **Retry deployment** |
| Can't find the repository in Cloudflare | Cloudflare's GitHub app doesn't have access to it | GitHub → **Settings → Applications → Cloudflare Workers and Pages → Configure** and add the repository (needs owner/admin) |
| Build log: the project name doesn't match | The name in Cloudflare differs from `wrangler.jsonc` | Make them the same |
| Live site shows "Cross-site POST form submissions are forbidden" | A form was posted from another address | Use the site's own address; this protection is on purpose |
| Sign-in works locally but not live | Wrong key or URL in Cloudflare | Compare the two variables with your `.env`; redeploy after changing them |
| Want to see errors from the live site | | Project → **Observability** (or **Logs**) in Cloudflare shows server errors, like the terminal does locally |

## Publishing by hand (optional)

You can also deploy from your own computer, without GitHub:

```
npx wrangler login
npm run deploy
```

`npm run deploy` reads the Supabase values from your local `.env` during the build.
