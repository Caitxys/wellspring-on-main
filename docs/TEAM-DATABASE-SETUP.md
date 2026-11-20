# Connecting to the Database and Getting Ready to Test

Everyone on the team runs the site on their **own computer**, but all of you connect to **one shared Supabase database**. This guide covers:

- **Part A:** one-time setup, done by whoever manages the team's Supabase project.
- **Part B:** connecting your own computer (every teammate).
- **Part C:** testing on a shared database: resetting the data, the restart test, usability sessions and which feature covers each kind of test.

> If you haven't built the feature yet, start with [FEATURE-GUIDE.md](FEATURE-GUIDE.md). For how sign-in works, see [SIGN-IN-README.md](SIGN-IN-README.md).

---

## Part A: One-time setup (Supabase project manager)

Only one person needs to do this.

### A1. Give teammates access to the Supabase project

Teammates need dashboard access to copy the connection values, run SQL and check data.

1. Open https://supabase.com/dashboard and select the team's **organization**, not the project.
2. Open the organization's **Team** (or **Members**) page and click **Invite**.
3. Enter each teammate's email. The **Developer** role is enough to run SQL and view keys.

If someone can't be invited, Part B explains how they can still connect.

### A2. Make sure the database is fully set up

In **SQL Editor**, these files should have been run, in this order:

| Order | File | What it does |
|---|---|---|
| 1 | Your team's database file (tables + sample data) | Creates the six tables and the fictional records |
| 2 | `database/01_auth_setup.sql` | Prepares the staff table for logins |
| 3 | (Create the test logins; see A3) | |
| 4 | `database/02_link_test_accounts.sql` | Links each login to its staff member by email |
| 5 | `database/03_feature_access.sql` | Access rules for the feature (from Step 1 of the feature guide) |

> **Already ran `03` earlier?** Run the **current** version again. It now allows content owners to unpublish an item when they archive it. It's safe to run more than once.

**Quick check:** run this in the SQL Editor:

```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY 1, 2;
```

You should see **9** rows. Fewer means `01` or `03` hasn't been run.

### A3. Test logins

These logins already exist in **Authentication → Users**:

| Email | Role | Use it to test |
|---|---|---|
| maya.okafor@wellspring-example.org | Programs Lead | Submitting requests |
| jordan.ellis@wellspring-example.org | Content Owner | Reviewing and archiving Jordan's items |
| priya.shah@wellspring-example.org | Content Owner | A second owner (checks owners can't touch each other's items) |
| dana.whitfield@wellspring-example.org | Executive Director | Seeing every request |

**Share the passwords privately** (a direct message or a password manager). Never put them in GitHub, the README, a report or a screenshot. If a password leaks, reset it under **Authentication → Users → … → Reset password** or by editing the user.

Optional: create a login for **luis.romero@wellspring-example.org** (Events Lead) the same way, then re-run `02_link_test_accounts.sql`.

---

## Part B: Connect your own computer (every teammate)

### B1. Get the latest code

```
git clone https://github.com/Caitxys/wellspring-on-main.git   # first time only
cd wellspring-on-main
git checkout main
git pull
npm install
```

Run `npm install` after every pull that changes `package.json`. It's harmless when nothing changed.

### B2. Create your `.env` file

`.env` holds the two values that connect the site to the database. It is **never** stored in GitHub, so each person makes their own.

1. Copy `.env.example` and name the copy `.env`.
2. Fill in the two values:

```
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
```

**Where to find them:**

- **If you were invited (A1):** Supabase → the project → **Project Settings**. The URL is under **Data API** (or **API**), and the publishable key is under **API Keys**.
- **If you weren't invited:** ask the project manager to send you the two values privately.

> Use the **publishable** key only. Never the secret / service-role key.
>
> If `.env` disappears after a `git pull`, that's because it was removed from GitHub. Just create it again as above.

### B3. Check the connection

1. Run `npm run dev` and open http://localhost:4321/login.
2. Sign in as Maya. You should land on the staff page with her name and role.
3. Open **My update requests**. You should see her requests, not an error.

If that works, you're connected to the shared database.

---

## Part C: Testing on a shared database

### C1. Everyone sees the same data

Whatever one person creates, approves or archives, **everyone** sees. To keep test results clear:

- **Agree who tests what**, so two people don't approve the same request at the same time.
- **Tag your test records.** Start proposed details with your initials and test ID, for example `[RV] T03: Workshop moves to Studio C.` That makes each record easy to find and cite as evidence ("Request #12").
- **Write down record numbers** (request #, content item #) in your test log as you go.
- **Expect sample data to change.** If request #1 is already approved, someone else approved it. Use a different record or reset (C2).

### C2. Resetting the test data

Reset before a final test run or a usability session, so everyone starts from the same known data.

> ⚠️ A reset **erases every record anyone has created** and restores the original sample data. Tell the team first. The **logins and passwords are not affected**.

In the Supabase **SQL Editor**, run these in order:

1. Your team's database file (tables + sample data). It drops and rebuilds the tables.
2. `database/01_auth_setup.sql`
3. `database/02_link_test_accounts.sql`
4. `database/03_feature_access.sql`

**All four, every time.** Step 1 removes the login links and access rules along with the tables; steps 2–4 put them back. If you stop after step 1, sign-in will show "not linked to a Wellspring staff member".

**After a reset**, the data looks like this:

| Request | Content item (owner) | Status |
|---|---|---|
| #1 | Saturday Youth Art Workshop (Jordan) | pending |
| #2 | Main Hall Rental Rates (Jordan) | pending |
| #3 | Community Yoga (Priya) | approved |
| #4 | Become a Nonprofit Partner (Priya) | rejected |

This reset order was tested on a copy of the team's database: all four logins relinked and the original data returned.

### C3. The server-restart test

This test proves that saved data comes from the database, not from the running app.

1. Create or change a record (for example, submit a request) and note its number.
2. In the Terminal running the site, press **Ctrl + C** to stop it.
3. Run `npm run dev` again.
4. Sign in again if asked, and open the same list or record. It should be unchanged.

### C4. Usability session with someone outside the team

- Run it on **your** computer, signed in as the right test account. Type the password yourself; don't give it to the participant.
- Give a **goal**, not click-by-click steps. Examples:
  - As Maya: *"The Saturday art workshop is moving to 1:00 PM in Studio A. Let the content owner know, then find where you'd check whether it was approved."*
  - As Jordan: *"Someone sent you a change to one of your web pages. Find it, update the page and publish it."*
- Reset the data first (C2), so the participant sees clean sample data.
- Note where they hesitate, what they say and any help you give.

### C5. Which feature covers each kind of test

| Test area | Where to test it | Example |
|---|---|---|
| Create | Submit an update request (Maya) | Valid request saves; confirmation shows the request # |
| Read | Requests list, then reload | Request still listed after reload |
| Update | Request detail → Approve and publish (Jordan) | Status and website text change, and stay changed after reload |
| Archive | My content → Archive (Priya or Jordan) | Item archived and unpublished |
| Relationship between records | Requests list, request detail, My content | Request shows its item's title, page and submitter; items show their audiences |
| Search / sort / filter | "Filter by status" on the requests list; "Show" on My content | Only matching records appear |
| Missing or invalid input | Submit form with empty details; console Check A | 400 and a clear message; nothing saved; other input kept |
| Business rule / conflicting action | Archive an item with a pending request; approve an already-reviewed request | 409 with an explanation; record unchanged |
| Unauthorized access | Console Check B; Maya opening `/staff/content`; Priya opening Jordan's request | 401 / 403 / 404; nothing changes |
| Persistence after restart | C3 above | Same data after restarting |
| Keyboard, labels, feedback | Use **Tab**, **Shift+Tab** and **Enter** only to submit a request and to approve one | Every field has a visible label; focus is visible; success and error messages appear in text |
| Public vs. private information | Signed out, open `/staff/requests` and run `fetch('/api/me')` | Sent to sign-in / 401; no request data is shown to visitors |

If something can't be tested because a feature is missing, mark that test **Blocked** and say why. Don't mark it as passing.

### C6. Screenshots and evidence

- Don't show passwords, the `.env` file or the Supabase **API Keys** page in screenshots.
- Use the browser console results (status number + message) as evidence for the direct checks.
- Supabase **Table Editor** screenshots are good evidence that a record was or wasn't saved.

---

## Troubleshooting

| What you see | What it means | Fix |
|---|---|---|
| "Missing Supabase env vars" when starting | No `.env`, or it's missing a value | B2. The file must be named exactly `.env`, in the main project folder |
| Sign-in says "That email and password do not match" | Wrong password, or the login doesn't exist | Check the password with the project manager; check **Authentication → Users** |
| "Signed in but not linked to a Wellspring staff member" | The data was reset but `02` wasn't run | Run `01`, `02`, `03` (C2 steps 2–4) |
| `permission denied for table …` in the Terminal | `03_feature_access.sql` hasn't been run since the last reset | Run it |
| Lists show different data than you expect | A teammate changed it, or someone reset the data | Check with the team; reset if needed (C2) |
| Your changes "disappeared" | Someone reset the data | Agree on reset times; re-create your test records |
| Errors mention `Invalid API key` | The key in `.env` is wrong, or someone generated a new one | Copy the current publishable key (B2); restart `npm run dev` |
| The site works for one teammate but not another | Different `.env` values or an old copy of the code | Compare `.env` values; run `git pull` and `npm install` |
