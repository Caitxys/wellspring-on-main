# Staff Sign-In and Roles: Plain-Language Setup Guide

This guide explains how staff sign-in was added to the Wellspring site, and how to set it up again yourself, step by step. You don't need a programming background. If you can copy and paste, follow a numbered list and use a website dashboard, you can do this.

For the technical version, see [AUTH.md](AUTH.md). Once sign-in works, build the update-request feature with [FEATURE-GUIDE.md](FEATURE-GUIDE.md).

---

## The big idea

This setup does two jobs:

1. **Sign-in (authentication).** It confirms *who you are*: you type your email and password, and the site checks them.
2. **Roles (authorization).** It decides *what you're allowed to do*. A Programs Lead can submit update requests. A Content Owner can review them. The Executive Director can see all of them.

**An analogy:** think of a front desk in an office building.

- The **sign-in page** is the front desk. You show your ID.
- The **staff list** in the database is the employee directory. The desk looks you up and finds your job title.
- Your **job title (role)** decides which doors your badge opens.
- Each **protected page or action** is a locked door. It checks your badge every time, so a sticky note claiming you're the director won't get you in.

Your role always comes from the staff list in the database. It never comes from anything the person's browser sends, which means nobody can promote themselves by editing a web page.

---

## What you need before you start

| You need | Why | Where to get it |
|---|---|---|
| A computer with **Node.js** (version 20 or newer) | Runs the website on your computer | https://nodejs.org (choose "LTS") |
| **VS Code** (or any text editor) | Lets you edit one settings file | https://code.visualstudio.com |
| Access to the team's **GitHub repository** | Holds the code | https://github.com/Caitxys/wellspring-on-main |
| Access to the team's **Supabase project** | Holds the database and the logins | https://supabase.com/dashboard |
| The team's tables already created in Supabase | The setup adds sign-in to the existing `staff` table | Your team's database SQL file |

To check that Node.js is installed, open the **Terminal** (Mac) or **Command Prompt** (Windows) and type:

```
node --version
```

You should see something like `v20.x.x` or higher.

---

## Part 1: Get the code onto your computer

Open the Terminal and run these lines one at a time. Press Enter after each one.

```
git clone https://github.com/Caitxys/wellspring-on-main.git
cd wellspring-on-main
git checkout authorization-and-authentication
npm install
```

What each line does:

1. Downloads a copy of the project.
2. Moves into the project folder.
3. Switches to the version that has sign-in. The project is stored in "branches", like separate drafts of a document.
4. Downloads the building blocks the project depends on. This can take a minute.

---

## Part 2: Connect the site to Supabase

The site needs two pieces of information to talk to the database: the project's **address** and its **public key**.

1. In the project folder, find the file named `.env.example`.
2. Make a copy of it and name the copy `.env` (just a dot followed by "env").
3. Open the Supabase dashboard, select the team's project, and click **Project Settings**.
4. Find the **Project URL**. It looks like `https://abcdefghijklmnop.supabase.co`. Depending on the dashboard version, it's under **Data API** or **API**.
5. Go to **API Keys** and copy the **Publishable key**. It starts with `sb_publishable_`. Older projects call it the **anon** key.
6. Paste both values into `.env`, so it looks like this:

```
PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxxxxxx
```

> ⚠️ **Never use the "secret" or "service_role" key.** That key bypasses every security rule. This project doesn't need it, and it should never be put in any file here.
>
> The `.env` file stays on your computer. Git is set up to never upload it, so the key doesn't end up on GitHub.

---

## Part 3: Prepare the database

This step teaches the database how to connect a login to a person in the staff list.

1. In Supabase, open **SQL Editor** from the left menu and click **New query**.
2. In VS Code, open `database/01_auth_setup.sql`, select all of it, and copy it.
3. Paste it into the Supabase SQL Editor and click **Run**.
4. Supabase may warn you about a "destructive operation". The warning appears because the file removes an old rule before replacing it. It's safe, so click **Run query**.
5. You should see "Success. No rows returned."

What this did, in plain terms:

- Added a column to the staff list where each person's login can be attached.
- Added two small helpers that answer "who is signed in?" and "what is their role?"
- Locked the staff list, so only signed-in staff can see it. Visitors see nothing.

You can run this file again safely; it won't duplicate anything.

---

## Part 4: Create the staff logins

There's no "Create account" page on the site, on purpose. Logins are made by an administrator in Supabase.

1. In Supabase, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter the person's email. **It must exactly match their email in the `staff` table.**
4. Choose a password and write it down somewhere safe. Don't put it in any project file.
5. Tick **Auto Confirm User**, so they can sign in right away without an email.
6. Click **Create user**.

Repeat for each person. The test accounts used so far are:

| Email | Role |
|---|---|
| maya.okafor@wellspring-example.org | Programs Lead |
| jordan.ellis@wellspring-example.org | Content Owner |
| priya.shah@wellspring-example.org | Content Owner |
| dana.whitfield@wellspring-example.org | Executive Director |

---

## Part 5: Link each login to its staff member

Supabase keeps logins and the staff list separately. This step connects them by matching emails.

1. Back in **SQL Editor**, open a new query.
2. Copy all of `database/02_link_test_accounts.sql`, paste it in, and click **Run**.
3. A table appears listing every staff member. The **can_sign_in** column should say `true` for each person you created a login for.

If someone shows `false`, their login email probably doesn't match their staff email exactly. Fix the spelling in either place, then run this file again. It's always safe to re-run, including whenever you add a new person later.

---

## Part 6: Start the site and test it

1. In the Terminal (inside the project folder), run:

   ```
   npm run dev
   ```

2. Leave that window open. Open your web browser and go to **http://localhost:4321/login**.
3. Sign in as one of the test accounts. You should land on a staff page showing your name, your role and what you're allowed to do.

### Check that the roles work

This test checks that a locked door stays locked for the wrong person.

1. While signed in, open the browser's developer console:
   - **Mac:** Cmd + Option + J (Chrome) or Cmd + Option + C (Safari)
   - **Windows:** Ctrl + Shift + J
2. Paste this line and press Enter:

   ```js
   fetch('/api/examples/review-check', { method: 'POST' }).then(async r => console.log(r.status, await r.json()))
   ```

3. Read the number at the start of the result:

| Signed in as | Expected number | What it means |
|---|---|---|
| Nobody (signed out) | **401** | "Please sign in first" |
| Maya (Programs Lead) | **403** | "You're signed in, but your role can't do this" |
| Jordan or Priya (Content Owner) | **200** | "Allowed" |

If you get these three numbers, everything is working. (This was confirmed on November 19, 2026.)

To stop the site, click the Terminal window and press **Ctrl + C**.

---

## Everyday tasks

### Add a new staff member who can sign in

1. Add them to the `staff` table, with their role, if they aren't there already.
2. Create their login (Part 4).
3. Run `02_link_test_accounts.sql` again (Part 5).

### Change someone's role

Edit the **role** column for that person in the `staff` table (Supabase → **Table Editor → staff**). The change applies the next time they load a page. Spell the role exactly as the site expects:

`Programs Lead` · `Events Lead` · `Content Owner` · `Executive Director`

### Change what a role is allowed to do

Open `src/lib/auth.ts` and find the `PERMISSIONS` list. It reads like plain sentences:

```ts
submit_request:    ['Programs Lead', 'Events Lead'],
review_request:    ['Content Owner'],
view_all_requests: ['Executive Director'],
```

Each line says "this action is allowed for these roles". Add or remove a role name inside the square brackets, keep the quotes and commas, and save. Every page and action on the site uses this one list.

---

## How it was built from scratch

If you ever need to recreate this in a brand-new project, these are the steps that were taken, in order. Each one maps to files that already exist here, so you can copy them over.

1. **Created an Astro website** and added the Cloudflare "adapter", which lets pages run on a server (Cloudflare Workers) instead of being plain files. The project started on a Node server and was later switched to Cloudflare for hosting; see [DEPLOY.md](DEPLOY.md).
   ```
   npm create astro@latest
   npm install @astrojs/cloudflare@12
   npm install -D wrangler
   ```
   Then set the adapter in `astro.config.mjs` and add `wrangler.jsonc` and `public/.assetsignore` (copy them from this project).
2. **Installed the Supabase tools** that handle logins and keep people signed in with a browser cookie:
   ```
   npm install @supabase/supabase-js @supabase/ssr
   ```
3. **Added the connection settings:** `.env.example` (the template) and `.env` (the real values, kept private).
4. **Added the database setup:** `database/01_auth_setup.sql` and `database/02_link_test_accounts.sql`.
5. **Added the "front desk"**, which runs on every visit:
   - `src/lib/supabase.ts`: opens a connection to Supabase for the visitor, using their sign-in cookie.
   - `src/middleware.ts`: asks Supabase who is signed in, then looks up their staff record and role.
6. **Added the rulebook:** `src/lib/auth.ts`, the list of which roles can do what.
7. **Added the "locked doors":**
   - `src/lib/page-guard.ts`: sends signed-out visitors to the sign-in page.
   - `src/lib/http.ts`: makes actions answer 401 (not signed in) or 403 (wrong role).
8. **Added the pages:**
   - `src/pages/login.astro`: the sign-in form.
   - `src/pages/api/auth/logout.ts`: signing out.
   - `src/pages/staff/index.astro`: an example page only staff can see.
   - `src/pages/api/me.ts` and `src/pages/api/examples/review-check.ts`: examples for testing.
9. **Tested** with three cases: signed out, the wrong role and the right role (Part 6).

---

## Troubleshooting

| What you see | What it means | How to fix it |
|---|---|---|
| "Missing Supabase env vars" | The site can't find your `.env` file | Make sure the file is named exactly `.env`, sits in the main project folder and has both lines filled in (Part 2) |
| "That email and password do not match" | Wrong password, or no login exists | Check Authentication → Users in Supabase; reset the password there if needed |
| "Signed in but not linked to a Wellspring staff member" | The login exists, but it isn't connected to the staff list | Make sure the emails match, then re-run `02_link_test_accounts.sql` |
| `column auth_user_id does not exist` when running file 02 | File 01 hasn't been run yet | Run `01_auth_setup.sql` first. If Supabase warns about "destructive operations", click **Run query** |
| `permission denied for table staff` | The database hasn't been told signed-in users may read the staff list | Re-run `01_auth_setup.sql`; it includes the fix |
| The page at localhost:4321 won't load | The site isn't running | Run `npm run dev` in the Terminal and keep that window open |
| `npm` or `node` "command not found" | Node.js isn't installed | Install it from https://nodejs.org, then close and reopen the Terminal |

---

## Words you'll see

- **Authentication:** proving who you are (signing in).
- **Authorization:** deciding what you're allowed to do (roles).
- **Supabase:** the online service that stores the database and the logins.
- **Astro:** the tool the website is built with.
- **Publishable key:** a public key that lets the site talk to Supabase. It's safe to use because the database's own rules still apply.
- **Secret / service_role key:** a master key that skips every rule. Never used here.
- **Row Level Security (RLS):** database rules that decide which records each person can see or change, even if someone goes around the website.
- **SQL Editor:** the place in Supabase where you paste and run database instructions.
- **Branch:** a separate draft of the code. Sign-in lives on `authorization-and-authentication`.
- **401 / 403 / 200:** short codes a website returns. 401 means "sign in first", 403 means "not allowed" and 200 means "OK".
