# Sign-in and roles: starter guide

This branch adds **authentication** (who is signed in) and **authorization** (what their role allows) to the Astro + Supabase project. The Assignment 7 feature itself is yours to build: the update-request workflow, its pages, validation, and Row Level Security for your tables. The hints at the end show where to start.

## What's included

| File | What it does |
|---|---|
| `database/01_auth_setup.sql` | Adds `staff.auth_user_id`, the `current_staff_id()` / `current_staff_role()` helpers, and RLS on `staff` |
| `database/02_link_test_accounts.sql` | Links each Supabase login to the staff row with the same email |
| `src/lib/supabase.ts` | Creates a Supabase client for each request, using the signed-in user's session cookie |
| `src/middleware.ts` | On every request, finds the signed-in user and their `staff` row (`Astro.locals.staff`) |
| `src/lib/auth.ts` | `PERMISSIONS` map (role → allowed actions) and `can(staff, permission)` |
| `src/lib/http.ts` | API guards: `requireStaff` (401/403) and `requirePermission` (403) |
| `src/lib/page-guard.ts` | Page guard: `requireStaffPage` redirects signed-out visitors to `/login` |
| `src/pages/login.astro` | Staff sign-in form (email + password) |
| `src/pages/api/auth/logout.ts` | Sign out |
| `src/pages/staff/index.astro` | Example protected page that shows the user's role and permissions |
| `src/pages/api/me.ts` | Example protected API route |
| `src/pages/api/examples/review-check.ts` | Example role-restricted API route (copy the pattern, then delete it) |

There's no registration page. Accounts are created in the Supabase dashboard, which the assignment allows.

## Setup

1. **Install:** `npm install`
2. **Configure:** copy `.env.example` to `.env`, then add the project URL and the **anon/publishable** key from Supabase → Project Settings → API. Never add the service-role key.
3. **Database:** in the Supabase SQL Editor, run `database/01_auth_setup.sql`.
4. **Test accounts:** go to Authentication → Users → Add user. Create a login for each test staff member using the **same email as their `staff` row**, and tick *Auto Confirm User*. For example:
   - `maya.okafor@wellspring-example.org` (Programs Lead)
   - `jordan.ellis@wellspring-example.org` (Content Owner)
   - `priya.shah@wellspring-example.org` (Content Owner)
   - `dana.whitfield@wellspring-example.org` (Executive Director)
5. **Link them:** run `database/02_link_test_accounts.sql`. The last query lists every staff member and shows `can_sign_in`.
6. **Run:** `npm run dev`, then open http://localhost:4321/login.

## How it works

```
Browser ──cookie──▶ middleware.ts ──▶ Supabase Auth: who is this?
                         │
                         └──▶ staff table: which staff member? which role?
                                   │
                    Astro.locals.staff = { staff_id, full_name, role }
                                   │
         page / API route ──▶ requireStaff / requirePermission / can(...)
```

- The role always comes from the **database** (`staff.role`), never from the browser. Never accept a `role` or `staff_id` sent in a form or JSON body.
- Use `staff.staff_id` from `locals` for columns like `submitted_by_staff_id` and `reviewed_by_staff_id`.
- All queries go through `Astro.locals.supabase`, which acts as the signed-in user. Once your tables have RLS policies, the database enforces them on every query too.

## Try it

After signing in, run these in the browser console:

```js
fetch('/api/me').then(async r => console.log(r.status, await r.json()));
fetch('/api/examples/review-check', { method: 'POST' })
  .then(async r => console.log(r.status, await r.json()));
```

| Signed in as | `/api/me` | `/api/examples/review-check` |
|---|---|---|
| Nobody | 401 | 401 |
| Maya (Programs Lead) | 200 | 403 |
| Jordan (Content Owner) | 200 | 200 |

These are the same kind of "direct request" checks the Assignment 7 README asks for.

## Hints for building your feature

**1. Decide the rules first.** Write down, per role, who can create, read, and update each record. Then edit `PERMISSIONS` in `src/lib/auth.ts` to match.

**2. Every protected API route follows the same order:**

```ts
export const POST: APIRoute = async ({ locals, request }) => {
  const staff = requirePermission(locals, 'submit_request');   // 401 / 403
  if (staff instanceof Response) return staff;

  const input = await request.json();                           // then validate → 400
  // ...check required fields, lengths, allowed values...

  const { data, error } = await locals.supabase
    .from('update_request')
    .insert({ /* use staff.staff_id here, not a value from the browser */ })
    .select()
    .single();
  // return json(201, { message: '...', ... }) or a helpful error
};
```

**3. Role checks aren't always enough.** Business Rule 6 says only the *owner of the content item* may approve. That depends on the record, not just the role, so load the item and compare `owner_staff_id` with `staff.staff_id` before saving.

**4. Protected pages:** start with `const staff = requireStaffPage(Astro); if (staff instanceof Response) return staff;`. Use `can(staff, '...')` to choose what to show, and remember the API route must check again.

**5. Add RLS to your own tables.** `01_auth_setup.sql` only protects `staff`. Until you add policies, the rest of your tables can be read and changed by anyone holding the public key. The bottom of that file has example policies built on `current_staff_id()` and `current_staff_role()`.

**6. Joins with supabase-js:** `update_request` has two foreign keys to `staff`, so name the column when you embed, for example `submitter:staff!submitted_by_staff_id(full_name)`.

**7. Two changes that must happen together** (approve the request *and* update the content item, like Operation 10) can be put in a Postgres function and called with `locals.supabase.rpc('function_name', {...})`, so both succeed or neither does.

**8. Test with more than one account.** Check what each role sees and can do, especially that one content owner can't approve another owner's items.
