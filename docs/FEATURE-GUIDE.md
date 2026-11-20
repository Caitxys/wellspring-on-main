# Feature Build Guide: The Update-Request Workflow

This guide walks your team through building the update-request feature on top of the sign-in and roles starter. Work through it in order. Each step says **what** you're building, **why** it's needed, **what to do** and **how to check** that it works before you move on.

> **Before you start:** sign-in must already work. If it doesn't, finish [SIGN-IN-README.md](SIGN-IN-README.md) first.
>
> Get the required pieces working first. Polish comes last.

---

## The feature in one paragraph

A **Programs Lead** or **Events Lead** submits a request to change a piece of website content (for example, a new workshop time). The **Content Owner** of that item sees it in their review queue, edits the website text and approves or rejects it. The **Executive Director** can see every request. This is the same workflow as your clickable prototype (`index.html` in the main folder).

## How each requirement is covered

| Requirement | Where it happens | Built in |
|---|---|---|
| **Create** | A lead submits the "Submit an update request" form | Steps 2–3 |
| **Read** | The requests list shows saved requests and survives a reload | Step 4 |
| **Related tables** | The list shows each request with its content item's title, the item's page and the submitter's name (`update_request` → `content_item` → `web_page`, and `update_request` → `staff`) | Step 4 |
| **Search / sort / filter** | A "Filter by status" menu (pending / approved / rejected) | Step 4 |
| **Update** | The content owner approves or rejects, which changes `request_status` and the item's text | Steps 5–6 |
| **Server validation** | The API routes reject missing or invalid fields with a 400 and a clear message | Steps 2 and 5 |
| **Protected access** | Every page and route checks who's signed in and their role on the server; the database rules check again | Steps 1, 2, 5 and 7 |

## The pieces you'll create

```
database/03_feature_access.sql        Step 1  who can read/write each table
src/pages/api/requests/index.ts       Step 2  POST: save a new request
src/pages/staff/requests/new.astro    Step 3  the submit form
src/pages/staff/requests/index.astro  Step 4  the list + filter
src/pages/api/requests/[id].ts        Step 5  PATCH: approve or reject
src/pages/staff/requests/[id].astro   Step 6  the request detail + review form
```

The staff home page (`/staff`) already shows a **Your tasks** box with links to these pages, matched to each person's role. A link shows "404 Not Found" until you create its page. That's expected.

The form and table styles are already in `src/styles/staff.css`, so the new pages look tidy without extra work. Restyle them later if you like.

> **Folder names matter.** Astro turns the file path into the web address: `src/pages/staff/requests/new.astro` becomes `/staff/requests/new`. A file named `[id].astro` matches any number, so `/staff/requests/7` opens that page with `id = 7`.

---

## Step 1: Database access rules

**Why:** Your tables start with **no** access from the website, so every query fails with `permission denied` until you allow it. You also need **Row Level Security (RLS)**, so the database itself refuses actions a person's role doesn't allow, even if someone skips the website. This covers the "Protected access" requirement at the database level.

**Do this:**

1. Create a new file, `database/03_feature_access.sql`, and paste in everything below.
2. In Supabase, open **SQL Editor → New query**, paste the same text and click **Run**. If Supabase warns about "destructive operations", click **Run query**. The warning comes from `DROP POLICY IF EXISTS`, which only replaces old rules.

```sql
-- =====================================================================
-- 03_feature_access.sql — who can read and change the feature's tables
-- Run AFTER 01_auth_setup.sql and 02_link_test_accounts.sql.
-- Safe to run more than once.
-- =====================================================================

-- 1. Let signed-in users reach the tables the feature uses -------------
GRANT SELECT ON web_page, audience, content_audience, content_item TO authenticated;
GRANT SELECT, INSERT ON update_request TO authenticated;
GRANT UPDATE (request_status, reviewed_by_staff_id, reviewed_at) ON update_request TO authenticated;
GRANT UPDATE (body, status, last_reviewed_date) ON content_item TO authenticated;
GRANT USAGE ON SEQUENCE update_request_request_id_seq TO authenticated;

-- 2. Turn on Row Level Security ----------------------------------------
ALTER TABLE web_page         ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience         ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_audience ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_item     ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_request   ENABLE ROW LEVEL SECURITY;

-- 3. Any signed-in staff member can read pages, audiences and content --
DROP POLICY IF EXISTS web_page_read_staff ON web_page;
CREATE POLICY web_page_read_staff ON web_page
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS audience_read_staff ON audience;
CREATE POLICY audience_read_staff ON audience
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS content_audience_read_staff ON content_audience;
CREATE POLICY content_audience_read_staff ON content_audience
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

DROP POLICY IF EXISTS content_item_read_staff ON content_item;
CREATE POLICY content_item_read_staff ON content_item
  FOR SELECT TO authenticated USING (public.current_staff_id() IS NOT NULL);

-- 4. Only an item's owner can change its text (Business Rule 6) --------
DROP POLICY IF EXISTS content_item_update_owner ON content_item;
CREATE POLICY content_item_update_owner ON content_item
  FOR UPDATE TO authenticated
  USING      (owner_staff_id = public.current_staff_id())
  WITH CHECK (owner_staff_id = public.current_staff_id());

-- 5. Who can read a request: the submitter, the item's owner, or the director
DROP POLICY IF EXISTS update_request_read ON update_request;
CREATE POLICY update_request_read ON update_request
  FOR SELECT TO authenticated
  USING (
    submitted_by_staff_id = public.current_staff_id()
    OR public.current_staff_role() = 'Executive Director'
    OR EXISTS (SELECT 1 FROM content_item c
               WHERE c.content_id = update_request.content_id
                 AND c.owner_staff_id = public.current_staff_id())
  );

-- 6. Who can submit: leads only, only as themselves, only as 'pending'
DROP POLICY IF EXISTS update_request_insert ON update_request;
CREATE POLICY update_request_insert ON update_request
  FOR INSERT TO authenticated
  WITH CHECK (
    public.current_staff_role() IN ('Programs Lead', 'Events Lead')
    AND submitted_by_staff_id = public.current_staff_id()
    AND request_status = 'pending'
  );

-- 7. Who can review: the item's owner, only pending requests, as themselves
DROP POLICY IF EXISTS update_request_review ON update_request;
CREATE POLICY update_request_review ON update_request
  FOR UPDATE TO authenticated
  USING (
    request_status = 'pending'
    AND EXISTS (SELECT 1 FROM content_item c
                WHERE c.content_id = update_request.content_id
                  AND c.owner_staff_id = public.current_staff_id())
  )
  WITH CHECK (
    reviewed_by_staff_id = public.current_staff_id()
    AND EXISTS (SELECT 1 FROM content_item c
                WHERE c.content_id = update_request.content_id
                  AND c.owner_staff_id = public.current_staff_id())
  );
```

**What these rules mean, in plain words:**

| Person | Can see requests… | Can submit? | Can approve/reject? |
|---|---|---|---|
| Maya (Programs Lead) | that she submitted | Yes, as herself | No |
| Jordan / Priya (Content Owner) | for content they own | No | Only for content they own, only while pending |
| Dana (Executive Director) | all of them | No | No |
| Signed-out visitor | none | No | No |

**Check it:** in the SQL Editor, run:

```sql
SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY 1, 2;
```

You should see 9 rules across 6 tables: the 8 created above, plus `staff_read_by_staff` from file 01.

These rules were tested against your team's database schema and sample data before this guide was written. Each person in the table above got exactly the access listed.

---

## Step 2: Save a new request (Create, part 1: the server)

**Why:** This is the server route the form sends to. It's where **validation** and **permission checks** happen. The browser can be bypassed, but the server can't.

Every protected route follows the same order:

1. **Who is asking, and are they allowed?** If not: 401 (not signed in) or 403 (wrong role).
2. **Read the input.**
3. **Validate it.** If something is missing or invalid: 400, with a message saying what to fix.
4. **Check that the related records exist.**
5. **Save**, using the signed-in person's ID, never an ID sent by the browser.
6. **Send back a clear confirmation.**

**Do this:** create `src/pages/api/requests/index.ts`:

```ts
import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * POST /api/requests — a Programs Lead or Events Lead submits an update request.
 * Body (JSON): { content_id: number, proposed_details: string }
 */
export const POST: APIRoute = async ({ locals, request }) => {
  // 1. Who is asking, and does their role allow this? (401 / 403)
  const staff = requirePermission(locals, 'submit_request');
  if (staff instanceof Response) return staff;

  // 2. Read what was sent.
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Send the form data as JSON.' });
  }

  // 3. Check every required field. Collect all problems at once.
  const contentId = Number(input.content_id);
  const details = String(input.proposed_details ?? '').trim();
  const errors: Record<string, string> = {};

  if (!Number.isInteger(contentId) || contentId <= 0) {
    errors.content_id = 'Choose the content item to update.';
  }
  if (details === '') {
    errors.proposed_details = 'Proposed details are required.';
  } else if (details.length < 10) {
    errors.proposed_details = 'Describe the change in at least 10 characters.';
  } else if (details.length > 2000) {
    errors.proposed_details = 'Keep the proposed details under 2,000 characters.';
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: 'Please fix the fields below.', errors });
  }

  // 4. Make sure the content item exists and is not archived.
  const { data: item } = await locals.supabase
    .from('content_item')
    .select('content_id, title, status')
    .eq('content_id', contentId)
    .maybeSingle();

  if (!item) {
    return json(400, { error: 'That content item does not exist.', errors: { content_id: 'Choose an item from the list.' } });
  }
  if (item.status === 'archived') {
    return json(400, { error: 'Archived content cannot be updated.', errors: { content_id: 'Choose an item that is not archived.' } });
  }

  // 5. Save. The submitter comes from the signed-in staff member, never from the browser.
  const { data, error } = await locals.supabase
    .from('update_request')
    .insert({
      content_id: contentId,
      submitted_by_staff_id: staff.staff_id,
      proposed_details: details,
    })
    .select('request_id, request_status')
    .single();

  if (error) {
    console.error('Saving update_request failed:', error);
    return json(500, { error: 'The request could not be saved. Please try again.' });
  }

  // 6. Clear confirmation.
  return json(201, {
    message: `Request #${data.request_id} was submitted for "${item.title}". Status: ${data.request_status}.`,
    request: data,
  });
};
```

**Check it:** sign in as **Maya**, open the browser console (Cmd+Option+J on Mac, Ctrl+Shift+J on Windows) and run:

```js
fetch('/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content_id: 3, proposed_details: 'Add a Saturday morning yoga class at 9:00 AM.' })
}).then(async r => console.log(r.status, await r.json()));
```

You should see **201** and a message like `Request #5 was submitted…`. Run it again with `proposed_details: ''` and you should get **400** with `Proposed details are required.`

---

## Step 3: The submit form (Create, part 2: the page)

**Why:** Users must be able to create a record **through the interface**, not only by calling the server directly. This page shows a form, sends it to the route from Step 2 and shows the success or error message.

The dropdown lists each content item with the **page it appears on**. That's your first use of related tables (`content_item` → `web_page`).

**Do this:** create `src/pages/staff/requests/new.astro`:

```astro
---
import StaffLayout from '../../../layouts/StaffLayout.astro';
import { can } from '../../../lib/auth';
import { requireStaffPage } from '../../../lib/page-guard';

export const prerender = false;

const staff = requireStaffPage(Astro);
if (staff instanceof Response) return staff;

const allowed = can(staff, 'submit_request');
if (!allowed) Astro.response.status = 403;

// Related tables: each content item plus the title of the page it appears on.
const { data: items, error } = allowed
  ? await Astro.locals.supabase
      .from('content_item')
      .select('content_id, title, web_page(page_title)')
      .neq('status', 'archived')
      .order('title')
  : { data: [], error: null };

if (error) console.error('Loading content items failed:', error);
---

<StaffLayout title="Submit an update request">
  <p><a href="/staff">← Staff home</a></p>
  <h1>Submit an update request</h1>

  {
    !allowed ? (
      <div class="alert alert-error">Only Programs Leads and Events Leads can submit update requests.</div>
    ) : (
      <form id="request-form" class="panel" novalidate>
        <div id="form-message" role="status" aria-live="polite" />

        <div class="field">
          <label for="content_id">Website content to update</label>
          <select id="content_id" name="content_id" required>
            <option value="">Choose a content item…</option>
            {(items ?? []).map((item: any) => (
              <option value={item.content_id}>
                {item.title} ({item.web_page?.page_title})
              </option>
            ))}
          </select>
          <p class="field-error" data-error-for="content_id" />
        </div>

        <div class="field">
          <label for="proposed_details">Proposed details</label>
          <textarea id="proposed_details" name="proposed_details" rows="5" required />
          <p class="field-error" data-error-for="proposed_details" />
        </div>

        <button type="submit" class="btn btn-primary">Submit request</button>
      </form>
    )
  }
</StaffLayout>

<script>
  const form = document.querySelector<HTMLFormElement>('#request-form');
  const message = document.querySelector<HTMLElement>('#form-message');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));

    const body = Object.fromEntries(new FormData(form));
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (message) {
      message.className = response.ok ? 'alert alert-success' : 'alert alert-error';
      message.textContent = response.ok ? result.message : result.error;
    }
    if (response.ok) {
      form.reset();
    } else {
      for (const [field, text] of Object.entries(result.errors ?? {})) {
        const slot = form.querySelector(`[data-error-for="${field}"]`);
        if (slot) slot.textContent = String(text);
      }
    }
  });
</script>
```

> **Why `novalidate`?** It turns off the browser's own "Please fill out this field" bubbles, so you can see the **server's** validation messages. The server's checks are the ones that count, because the browser's can be skipped.

**Check it:** as Maya, open `/staff/requests/new`.

- Submit with nothing filled in. You should see red messages under both fields.
- Fill in both fields and submit. You should see a green box saying `Request #… was submitted…`.
- Sign in as Jordan and open the same address. You should see "Only Programs Leads and Events Leads can submit…".

---

## Step 4: The requests list, with a filter (Read + Related tables + Filter)

**Why:** This one page covers three requirements:

- **Read:** it shows saved requests, which are still there after a reload.
- **Related tables:** each row combines `update_request` with `content_item` (title), `web_page` (page title) and `staff` (submitter's name).
- **Filter:** a "Filter by status" menu changes which requests appear.

Each person sees only what they should. The page asks for the right records, and the database rules from Step 1 enforce it anyway.

**Do this:** create `src/pages/staff/requests/index.astro`:

```astro
---
import StaffLayout from '../../../layouts/StaffLayout.astro';
import { can } from '../../../lib/auth';
import { requireStaffPage } from '../../../lib/page-guard';

export const prerender = false;

const staff = requireStaffPage(Astro);
if (staff instanceof Response) return staff;

// Filter control: ?status=pending | approved | rejected (anything else = all)
const STATUSES = ['pending', 'approved', 'rejected'];
const status = Astro.url.searchParams.get('status') ?? 'all';

// Related tables: request + its content item + that item's page + the submitter's name.
let query = Astro.locals.supabase
  .from('update_request')
  .select(
    `request_id, request_status, proposed_details, submitted_at,
     content_item!inner ( content_id, title, owner_staff_id, web_page ( page_title ) ),
     submitter:staff!submitted_by_staff_id ( full_name )`,
  );

// Who sees what:
//   Executive Director -> every request
//   Content Owner      -> requests for content they own
//   Leads              -> requests they submitted
if (!can(staff, 'view_all_requests')) {
  if (can(staff, 'review_request')) {
    query = query.eq('content_item.owner_staff_id', staff.staff_id);
  } else {
    query = query.eq('submitted_by_staff_id', staff.staff_id);
  }
}

if (STATUSES.includes(status)) {
  query = query.eq('request_status', status);
}

const { data: requests, error } = await query.order('submitted_at', { ascending: false });
if (error) console.error('Loading requests failed:', error);
---

<StaffLayout title="Update requests">
  <p><a href="/staff">← Staff home</a></p>
  <h1>Update requests</h1>

  <form method="get" class="toolbar">
    <div class="field">
      <label for="status">Filter by status</label>
      <select id="status" name="status">
        <option value="all" selected={status === 'all'}>All</option>
        {STATUSES.map((s) => <option value={s} selected={status === s}>{s}</option>)}
      </select>
    </div>
    <button type="submit" class="btn btn-secondary btn-sm">Apply</button>
  </form>

  {error && <div class="alert alert-error">The requests could not be loaded. Check the terminal for details.</div>}

  {
    requests && requests.length > 0 ? (
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Content (page)</th>
            <th>Submitted by</th>
            <th>Status</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r: any) => (
            <tr>
              <td><a href={`/staff/requests/${r.request_id}`}>#{r.request_id}</a></td>
              <td>
                {r.content_item?.title} <span class="muted">({r.content_item?.web_page?.page_title})</span>
              </td>
              <td>{r.submitter?.full_name}</td>
              <td><span class={`status status-${r.request_status}`}>{r.request_status}</span></td>
              <td>{new Date(r.submitted_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      !error && <p class="alert alert-info">No matching requests.</p>
    )
  }
</StaffLayout>
```

**Understanding the query (the tricky part):**

- `content_item!inner ( … )` brings in the related content item. `!inner` means "only keep requests that have a matching item", which is what lets you filter on `content_item.owner_staff_id`.
- `web_page ( page_title )` inside it goes one more step: the item's page.
- `submitter:staff!submitted_by_staff_id ( full_name )` brings in the submitter's name. `update_request` links to `staff` **twice** (submitter and reviewer), so `!submitted_by_staff_id` says which link to follow, and `submitter:` names the result.

**Check it:**

| Signed in as | Expect to see |
|---|---|
| Maya | Only requests she submitted |
| Jordan | Requests for Jordan's items (Youth Art Workshop, Main Hall Rental Rates) |
| Priya | Requests for Priya's items (Community Yoga, Nonprofit Partner) |
| Dana | Every request |

Then:

- Choose **pending** and click **Apply**. Only pending requests should appear, and the address bar should show `?status=pending`.
- Reload the page. The same records and the same filter should still be there.

---

## Step 5: Approve or reject (Update, part 1: the server)

**Why:** This is the **Update** requirement. It also enforces your business rules:

- **Rule 5:** an approved or rejected request must record **who** reviewed it and **when**.
- **Rule 6:** only the **owner** of the content item may review it. A role check alone isn't enough here, because Priya is a Content Owner too, but she doesn't own Jordan's items.
- A request that has already been reviewed can't be reviewed again.

When a request is approved, the content item's text is updated and its status is set to `current`.

**Do this:** create `src/pages/api/requests/[id].ts`:

```ts
import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * PATCH /api/requests/:id — the content item's owner approves or rejects a request.
 * Body (JSON): { decision: 'approved' | 'rejected', new_body?: string }
 * When approving, new_body is the updated website text for the content item.
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
  // 1. Signed in, and a role that may review? (401 / 403)
  const staff = requirePermission(locals, 'review_request');
  if (staff instanceof Response) return staff;

  // 2. Read and check the input. (400)
  const requestId = Number(params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return json(400, { error: 'That is not a valid request number.' });
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Send the review as JSON.' });
  }

  const decision = String(input.decision ?? '');
  const newBody = String(input.new_body ?? '').trim();
  const errors: Record<string, string> = {};

  if (decision !== 'approved' && decision !== 'rejected') {
    errors.decision = 'Choose Approve or Reject.';
  }
  if (decision === 'approved' && newBody.length < 10) {
    errors.new_body = 'Enter the updated website text (at least 10 characters).';
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: 'Please fix the fields below.', errors });
  }

  // 3. Load the request and its content item. (404)
  const { data: req } = await locals.supabase
    .from('update_request')
    .select('request_id, request_status, content_id, content_item(owner_staff_id, title)')
    .eq('request_id', requestId)
    .maybeSingle();

  if (!req) {
    return json(404, { error: `Request #${requestId} was not found.` });
  }

  // 4. Business Rule 6: only the owner of this content item may review it. (403)
  const item = req.content_item as unknown as { owner_staff_id: number; title: string };
  if (item.owner_staff_id !== staff.staff_id) {
    return json(403, { error: 'Only the owner of this content item can review this request.' });
  }

  // 5. Only pending requests can be reviewed. (409)
  if (req.request_status !== 'pending') {
    return json(409, { error: `This request was already ${req.request_status}.` });
  }

  // 6. Save the decision. Business Rule 5: record who reviewed it and when.
  const { data: saved, error: reviewError } = await locals.supabase
    .from('update_request')
    .update({
      request_status: decision,
      reviewed_by_staff_id: staff.staff_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('request_id', requestId)
    .eq('request_status', 'pending')
    .select('request_id');

  if (reviewError || !saved || saved.length === 0) {
    console.error('Saving the review failed:', reviewError ?? 'no rows updated (check RLS policies)');
    return json(500, { error: 'The review could not be saved. Please try again.' });
  }

  // 7. If approved, update the website text too.
  if (decision === 'approved') {
    const { data: updated, error: contentError } = await locals.supabase
      .from('content_item')
      .update({
        body: newBody,
        status: 'current',
        last_reviewed_date: new Date().toISOString().slice(0, 10),
      })
      .eq('content_id', req.content_id)
      .select('content_id');

    if (contentError || !updated || updated.length === 0) {
      console.error('Updating content_item failed:', contentError ?? 'no rows updated (check RLS policies)');
      return json(500, { error: 'The request was approved, but the website text could not be updated.' });
    }
  }

  return json(200, {
    message:
      decision === 'approved'
        ? `Request #${requestId} approved. "${item.title}" now shows the new text.`
        : `Request #${requestId} rejected.`,
  });
};
```

> **Why the `saved.length === 0` check?** When the database rules block an update, Supabase doesn't report an error. It just changes zero rows. Asking for the changed rows back (`.select(...)`) and counting them is how you notice.

**Check it:** sign in as **Priya** and try to approve request 1, which belongs to Jordan's item:

```js
fetch('/api/requests/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ decision: 'approved', new_body: 'Priya should not be able to do this.' })
}).then(async r => console.log(r.status, await r.json()));
```

You should get **404**: `Request #1 was not found.` The database rules from Step 1 don't even let Priya see requests for Jordan's content, so the server treats the request as if it doesn't exist. The owner check in part 4 of the route is a second layer of protection, in case those rules are ever changed or missing.

To see a **403**, run the same code while signed in as **Maya** (wrong role) or **Dana** (the director can view but not approve). Step 6 tests the successful version through the page.

---

## Step 6: The request detail page with the review form (Update, part 2: the page)

**Why:** Users must be able to update a record **through the interface** and see that the change stays after a reload. This page shows everything about one request, pulled from four tables, and, for the item's owner only, the review form.

**Do this:** create `src/pages/staff/requests/[id].astro`:

```astro
---
import StaffLayout from '../../../layouts/StaffLayout.astro';
import { can } from '../../../lib/auth';
import { requireStaffPage } from '../../../lib/page-guard';

export const prerender = false;

const staff = requireStaffPage(Astro);
if (staff instanceof Response) return staff;

const requestId = Number(Astro.params.id);

// Row Level Security only returns this request if this person may see it.
const { data: r, error } = await Astro.locals.supabase
  .from('update_request')
  .select(
    `request_id, request_status, proposed_details, submitted_at, reviewed_at,
     content_item ( content_id, title, body, owner_staff_id, web_page ( page_title ),
                    owner:staff!owner_staff_id ( full_name ) ),
     submitter:staff!submitted_by_staff_id ( full_name ),
     reviewer:staff!reviewed_by_staff_id ( full_name )`,
  )
  .eq('request_id', requestId)
  .maybeSingle();

if (error) console.error('Loading request failed:', error);
if (!r) Astro.response.status = 404;

const req = r as any;
const canReview =
  !!req &&
  can(staff, 'review_request') &&
  req.content_item?.owner_staff_id === staff.staff_id &&
  req.request_status === 'pending';
---

<StaffLayout title={req ? `Request #${req.request_id}` : 'Request not found'}>
  <p><a href="/staff/requests">← All requests</a></p>

  {
    !req ? (
      <div class="alert alert-error">This request does not exist, or you do not have access to it.</div>
    ) : (
      <>
        <h1>Request #{req.request_id}: {req.content_item?.title}</h1>
        <section class="panel">
          <p><strong>Page:</strong> {req.content_item?.web_page?.page_title}</p>
          <p><strong>Content owner:</strong> {req.content_item?.owner?.full_name}</p>
          <p><strong>Submitted by:</strong> {req.submitter?.full_name} on {new Date(req.submitted_at).toLocaleString()}</p>
          <p><strong>Status:</strong> <span class={`status status-${req.request_status}`}>{req.request_status}</span>
            {req.reviewer && <> (by {req.reviewer.full_name})</>}
          </p>
          <h2>Proposed details</h2>
          <p>{req.proposed_details}</p>
          <h2>Current website text</h2>
          <p>{req.content_item?.body}</p>
        </section>

        {canReview && (
          <form id="review-form" class="panel" data-request-id={req.request_id} novalidate>
            <h2>Review this request</h2>
            <div id="form-message" role="status" aria-live="polite" />

            <div class="field">
              <label for="new_body">Updated website text (required to approve)</label>
              <textarea id="new_body" name="new_body" rows="5">{req.content_item?.body}</textarea>
              <p class="field-error" data-error-for="new_body" />
            </div>
            <p class="field-error" data-error-for="decision" />

            <div class="button-row">
              <button type="submit" name="decision" value="approved" class="btn btn-primary">Approve and publish</button>
              <button type="submit" name="decision" value="rejected" class="btn btn-secondary">Reject</button>
            </div>
          </form>
        )}
      </>
    )
  }
</StaffLayout>

<script>
  const form = document.querySelector<HTMLFormElement>('#review-form');
  const message = document.querySelector<HTMLElement>('#form-message');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''));

    const button = event.submitter as HTMLButtonElement | null;
    const body = { decision: button?.value, new_body: new FormData(form).get('new_body') };

    const response = await fetch(`/api/requests/${form.dataset.requestId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();

    if (message) {
      message.className = response.ok ? 'alert alert-success' : 'alert alert-error';
      message.textContent = response.ok ? `${result.message} Reloading…` : result.error;
    }
    if (response.ok) {
      setTimeout(() => location.reload(), 1500);
    } else {
      for (const [field, text] of Object.entries(result.errors ?? {})) {
        const slot = form.querySelector(`[data-error-for="${field}"]`);
        if (slot) slot.textContent = String(text);
      }
    }
  });
</script>
```

**Check it:**

1. Sign in as **Jordan**, open `/staff/requests?status=pending` and click **#1** (Youth Art Workshop).
2. Change the website text to `Free art workshop for ages 8-14, Saturdays 1:00-2:30 PM in Studio A.` and click **Approve and publish**.
3. You should see a green message, and the page reloads. The status now says **approved (by Jordan Ellis)**, the current website text shows your edit, and the review form is gone.
4. Reload again. The change stays.
5. Sign in as **Priya** and open `/staff/requests/2`. You should see "This request does not exist, or you do not have access to it." She doesn't own that item, so the database won't even return it.

---

## Step 7: The two direct checks the README must include

Your README must show how to send requests **directly to the server**, skipping the form, to prove the server protects itself. Paste these into the browser console.

**Check A: invalid input is rejected (validation).** Sign in as **Maya** and run:

```js
fetch('/api/requests', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content_id: 3, proposed_details: '' })
}).then(async r => console.log(r.status, await r.json()));
```

Expected: **400**, `Proposed details are required.` Then reload `/staff/requests`; no new request was saved.

**Check B: protected action without permission.** Run this twice. Replace `2` with any pending request number.

```js
fetch('/api/requests/2', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ decision: 'approved', new_body: 'Trying to approve without permission.' })
}).then(async r => console.log(r.status, await r.json()));
```

| Run it while… | Expected | Why |
|---|---|---|
| Signed out | **401** `Please sign in to continue.` | Not signed in |
| Signed in as Maya | **403** `Your role (Programs Lead) does not allow this action.` | Wrong role |
| Signed in as Dana | **403** `Your role (Executive Director) does not allow this action.` | Can view every request, but can't approve |
| Signed in as Priya | **404** `Request #2 was not found.` | Right role, but not her content, so the database hides it from her entirely |

Afterwards, sign in as Jordan and confirm request 2 is still **pending**.

> **Signing out for Check B:** use the **Sign out** button, then open any page on `http://localhost:4321` (for example `/login`) and run the code in that tab's console.

---

## Step 8: Finish up

- [ ] **Remove the example route** `src/pages/api/examples/review-check.ts` once your real routes work. It was only there to test roles.
- [ ] **Sample data:** your team's database SQL already includes fictional data with requests in every status. Include it in the `database/` folder as `00_schema_and_sample_data.sql` (or similar), so anyone running the project can rebuild the database.
- [ ] **Run order** for the README: `00_…` (your tables and sample data) → `01_auth_setup.sql` → create the test logins → `02_link_test_accounts.sql` → `03_feature_access.sql`. This matches the order in [SIGN-IN-README.md](SIGN-IN-README.md).
- [ ] **Run `npx astro check`** in the Terminal. It should say `0 errors`.
- [ ] **Run `npm run build`.** It should finish without errors.
- [ ] **Write the README** (template below) and walk through it on a fresh sign-in, as if you were someone seeing the project for the first time.
- [ ] **Make sure `.env` is not in your submission** (Git already ignores it) and `.env.example` is.

---

## Full test run (do this before you submit)

| # | Signed in as | Do this | Expected |
|---|---|---|---|
| 1 | Maya | Submit a request with empty details | Red error messages; nothing saved |
| 2 | Maya | Submit a valid request for "Saturday Youth Art Workshop" | Green "Request #… was submitted" |
| 3 | Maya | Open **My update requests** and reload | The new request is listed as pending |
| 4 | Jordan | Open **Review queue** | Request from step 2 appears, with Maya's name and the page title |
| 5 | Jordan | Filter: **approved**, then **All** | List changes to match the filter |
| 6 | Jordan | Open the request, edit the text, **Approve and publish**, then reload | Status approved, new text shown, still there after reload |
| 7 | Priya | Open that same request by its number | "Does not exist, or you do not have access" |
| 8 | Dana | Open **All update requests** | Every request is listed |
| 9 | Anyone | Direct checks A and B (Step 7) | 400, then 401 / 403 / 404 |

---

## Troubleshooting

**Golden rule:** when something fails, look in **two places**:

1. **The Terminal running `npm run dev`.** The routes print the real database error there (lines starting with `Saving…failed` or `Loading…failed`).
2. **The browser console.** It shows the status number and message the server sent back.

| What you see | What it usually means | Fix |
|---|---|---|
| `permission denied for table …` | The table hasn't been opened up to signed-in users | Run `03_feature_access.sql` (Step 1). If you added a new table, add a `GRANT` line for it |
| `permission denied for sequence update_request_request_id_seq` | Saving a new row needs permission to use the ID counter | Make sure the `GRANT USAGE ON SEQUENCE …` line in Step 1 ran |
| `new row violates row-level security policy for table "update_request"` | The database refused the action for this person | Check you're signed in as the right role. Submitting must be done by a lead, as themselves |
| Review returns 500 and the Terminal says `no rows updated (check RLS policies)` | The database rules blocked the update | Check the person owns the content item and the request is still pending. Re-run Step 1 if the rules are missing |
| The list is empty, but you know requests exist | Either the filter is hiding them or the rules are | Set the filter to **All**. Sign in as Dana, who sees everything. If Dana sees nothing either, re-run Step 1 |
| The dropdown on the submit form is empty | Can't read `content_item` | Re-run Step 1. Check the Terminal for `Loading content items failed` |
| `Could not find a relationship between 'update_request' and 'staff'` or `more than one relationship was found` | The query is missing the "which link?" hint | Use `staff!submitted_by_staff_id`, exactly as in Step 4 |
| Console says `Unexpected token '<'` or `is not valid JSON` | The address doesn't match a route, so you got an HTML "404" page back | Check the file is at `src/pages/api/requests/index.ts` (or `[id].ts`) and the `fetch` address is `/api/requests` |
| New page shows "404 Not Found" | The file is in the wrong folder or has the wrong name | Compare with "The pieces you'll create". Stop the server with Ctrl+C and run `npm run dev` again |
| Console check returns **401** even though you're signed in | You're on a different address than the one you signed in on | Use `http://localhost:4321` everywhere, not `127.0.0.1` |
| 403 `Your role (…) does not allow this action.` when you expected success | The role spelling in the database doesn't match `src/lib/auth.ts` | Spell the role exactly: `Programs Lead`, `Events Lead`, `Content Owner`, `Executive Director` |
| `violates check constraint "review_matches_status"` | Rule 5: approving or rejecting needs both a reviewer and a review time | Use the route from Step 5, which sets both |
| `violates check constraint "archived_not_published"` | Rule 9: archived items can't be published | Don't set an archived item to published |
| Changes to `.env` don't take effect | The server reads `.env` only at start-up | Stop with Ctrl+C and run `npm run dev` again |

**Asking for help well:** copy the **exact** error from the Terminal and the console, say who you were signed in as, and what you clicked. That's usually enough to find the problem in a few minutes.

---

## Optional extras (only after everything above works)

- **Public page for visitors:** show published content on the public site. You'd add `GRANT SELECT ON content_item, web_page TO anon;` and a rule such as `USING (is_published AND status <> 'archived')` for `anon`.
- **Mark an item as "pending review" when a request is submitted.** Leads can't edit content items, so this is best done with a database trigger.
- **Make approve and update a single all-or-nothing step**, using a Postgres function called with `locals.supabase.rpc(...)`.
- **Search by title** on the list page, with `.ilike('content_item.title', '%' + term + '%')`.

---

## README template for your submission

Your `README.md` goes in the main project folder and must use these five headings. Replace everything in [brackets].

````markdown
# Wellspring Content Update Requests — [Team name]

**Team:** Caitlin Hartman, Rosa Vargas, Dylan McKoy, Preston Page, Andrew Looney, Hamshini Ananth

## 1. Feature summary
Programs Leads and Events Leads submit requests to update website content. The Content Owner of each item reviews the request, edits the website text, and approves or rejects it. The Executive Director can see every request.

The feature uses related tables: `update_request` references `content_item` (which references `web_page`) and `staff` (submitter and reviewer).

## 2. Setup and access
**What you need:** Node.js 20 or newer, npm, and a Supabase project.

**Install:** `npm install`

**Database:** in the Supabase SQL Editor, run in this order:
1. `database/[00_schema_and_sample_data].sql` — tables and fictional sample data
2. `database/01_auth_setup.sql` — prepares the staff table for logins
3. Create the test accounts (below)
4. `database/02_link_test_accounts.sql` — links each login to its staff row by email
5. `database/03_feature_access.sql` — access rules for the feature

**Test accounts:** in Supabase → Authentication → Users → Add user, create these with passwords you choose and tick *Auto Confirm User*:
- maya.okafor@wellspring-example.org (Programs Lead)
- jordan.ellis@wellspring-example.org (Content Owner)
- priya.shah@wellspring-example.org (Content Owner)
- dana.whitfield@wellspring-example.org (Executive Director)

**Configure:** copy `.env.example` to `.env` and set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` (the publishable key) from Supabase → Project Settings. No secret key is used.

**Run:** `npm run dev`, then open http://localhost:4321/login

## 3. Try the workflow
1. **Create:** sign in as Maya → Submit an update request → choose "Saturday Youth Art Workshop", enter new details → Submit. A confirmation shows the request number.
2. **Read + related tables:** open My update requests and reload. The request shows its content item, page and submitter.
3. **Update:** sign in as Jordan → Review queue → open the request → edit the text → Approve and publish. Reload: the status stays approved and the new text is shown.
4. **Filter:** on the requests list, choose a status and click Apply.
5. **Invalid request (expect 400):** [paste Check A from the guide]
6. **Protected request (expect 401 signed out, 403 as Maya or Dana, 404 as Priya):** [paste Check B from the guide]

## 4. Known limitations
- [List anything that doesn't work yet, or write "No known issues."]
- Accounts are created in the Supabase dashboard; there is no registration page.
- The feature uses fictional data.

## 5. Contributions and AI use
| Member | Main contribution |
|---|---|
| [Name] | [What they did] |

**AI use:** [What AI helped with, and what your team checked yourselves.]
````
