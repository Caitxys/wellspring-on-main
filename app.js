/* Wellspring Content Update Manager — clickable prototype (Assignment 6)
   SIMULATED: no database connection. All reads and writes use a copy of
   window.SEED held in browser memory; reloading the page resets it.
   Validation runs in the browser only. In Assignment 7 the Express routes
   and the database constraints must enforce the same rules. */

const db = JSON.parse(JSON.stringify(window.SEED), (k, v) =>
  (k.endsWith("_date") || k.endsWith("_at")) && typeof v === "string" ? new Date(v) : v);

const ROLES = {
  lead:    { label: "Program lead",  staff_id: 2, start: "#submit" },
  owner:   { label: "Content owner", staff_id: 1, start: "#queue" },
  visitor: { label: "Visitor",       staff_id: null, start: "#page-programs" }
};
let role = "lead";
let flash = null;          // one-time message shown after an action
let formDraft = null;      // keeps user input when validation fails

// ---------- helpers ----------
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const staff = (id) => db.staff.find((s) => s.staff_id === id);
const page = (id) => db.web_page.find((p) => p.page_id === id);
const item = (id) => db.content_item.find((c) => c.content_id === id);
const req = (id) => db.update_request.find((r) => r.request_id === id);
const me = () => staff(ROLES[role].staff_id);
const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const daysSince = (d) => Math.round((today() - new Date(d).setHours(0, 0, 0, 0)) / 86400000);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtDateTime = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const LABELS = { pending: "Pending", approved: "Approved", rejected: "Rejected", current: "Current", needs_update: "Needs update", pending_review: "Pending review", archived: "Archived" };
const badge = (s) => `<span class="badge b-${s}">${LABELS[s] || s}</span>`;
const audiencesFor = (cid) => db.content_audience.filter(([c]) => c === cid).map(([, a]) => db.audience.find((x) => x.audience_id === a).audience_name);
const alertHtml = (f) => f ? `<div class="alert alert-${f.type}" role="${f.type === "error" ? "alert" : "status"}">${f.html}</div>` : "";

// ---------- layout ----------
const NAV = {
  lead: [["#submit", "Submit update"], ["#my-requests", "My requests"]],
  owner: [["#queue", "Review queue"], ["#content", "My content"]],
  visitor: [["#page-home", "Home"], ["#page-programs", "Programs"], ["#page-nonprofits", "Nonprofits"], ["#page-event-rentals", "Event rentals"], ["#page-tenants", "Tenants"]]
};

function frame(screenNo, screenName, body) {
  const hash = location.hash.split("?")[0];
  const nav = NAV[role].map(([h, t]) => `<a href="${h}"${hash.startsWith(h) ? ' aria-current="page"' : ""}>${t}</a>`).join("");
  const who = me() ? ` · ${esc(me().full_name)}` : "";
  $("#app").innerHTML = `
    <header class="topbar"><div class="topbar-inner">
      <a class="logo" href="${ROLES[role].start}"><span class="logo-mark" aria-hidden="true">W</span>
        <span>Wellspring on Main<small>${role === "visitor" ? "Community Center" : "Content Update Manager"}</small></span></a>
      <nav class="nav" aria-label="Main">${nav}</nav>
    </div></header>
    <div class="screen-meta"><span class="role-tag">Role: ${ROLES[role].label}${who}</span>
      <span class="screen-tag">Screen ${screenNo} · ${screenName}</span></div>
    <main id="main" tabindex="-1">${body}</main>
    <footer class="proto-bar"><div class="proto-bar-inner">
      <span class="tag">PROTOTYPE</span>
      <label for="role-switch">View as</label>
      <select id="role-switch">${Object.entries(ROLES).map(([k, r]) => `<option value="${k}"${k === role ? " selected" : ""}>${r.label}${r.staff_id ? " (" + staff(r.staff_id).full_name + ")" : ""}</option>`).join("")}</select>
      <span class="note">Simulated data · resets on reload</span>
    </div></footer>`;
  $("#role-switch").addEventListener("change", (e) => { role = e.target.value; flash = null; location.hash = ROLES[role].start; });
}

function denied(roleNeeded) {
  frame("—", "Not available", `<div class="card"><h1>This view is for ${roleNeeded}s</h1>
    <p class="lead">You are viewing as ${ROLES[role].label}. Switch roles in the footer to continue.</p>
    <a class="btn btn-primary" href="${ROLES[role].start}">Go to my start page</a></div>`);
}

// ---------- Screen 1 & 2: submit form (+ error state) ----------
function submitForm(errors = {}) {
  if (role !== "lead") return denied("program lead");
  const d = formDraft || { content_id: "", proposed_details: "" };
  const groups = db.web_page.map((p) => {
    const opts = db.content_item.filter((c) => c.page_id === p.page_id && c.status !== "archived")
      .map((c) => `<option value="${c.content_id}"${String(d.content_id) === String(c.content_id) ? " selected" : ""}>${esc(c.title)}</option>`).join("");
    return opts ? `<optgroup label="${esc(p.page_title)} (${p.page_slug})">${opts}</optgroup>` : "";
  }).join("");
  const hasErr = Object.keys(errors).length > 0;
  frame(hasErr ? 2 : 1, hasErr ? "Missing-details error" : "Submit an update request", `
    <h1>Submit an update request</h1>
    <p class="lead">Tell the content owner what changed. Your request goes to the person responsible for that part of the website.</p>
    ${hasErr ? alertHtml({ type: "error", html: `<b>Please fix ${Object.keys(errors).length === 1 ? "1 field" : Object.keys(errors).length + " fields"} below.</b> Your other entries were kept.` }) : ""}
    <form class="card" id="req-form" novalidate>
      <div class="field${errors.content_id ? " has-error" : ""}">
        <label for="content_id">Website content to update</label>
        <p class="hint" id="content-hint">Grouped by page. Archived content is not listed.</p>
        <select id="content_id" name="content_id" aria-describedby="content-hint${errors.content_id ? " content-err" : ""}"${errors.content_id ? ' aria-invalid="true"' : ""}>
          <option value="">Choose a content item…</option>${groups}</select>
        ${errors.content_id ? `<p class="error-text" id="content-err">⚠ ${errors.content_id}</p>` : ""}
      </div>
      <div class="field${errors.proposed_details ? " has-error" : ""}">
        <label for="proposed_details">Proposed details</label>
        <p class="hint" id="details-hint">Include the new dates, times, rooms, or prices exactly as they should appear.</p>
        <textarea id="proposed_details" name="proposed_details" aria-describedby="details-hint${errors.proposed_details ? " details-err" : ""}"${errors.proposed_details ? ' aria-invalid="true"' : ""}>${esc(d.proposed_details)}</textarea>
        ${errors.proposed_details ? `<p class="error-text" id="details-err">⚠ ${errors.proposed_details}</p>` : ""}
      </div>
      <div class="actions"><button class="btn btn-primary" type="submit">Submit request</button>
        <a class="btn btn-secondary" href="#my-requests">Cancel</a></div>
    </form>`);
  $("#req-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const content_id = $("#content_id").value;
    const proposed_details = $("#proposed_details").value.trim();
    const errs = {};
    if (!content_id) errs.content_id = "Choose the content item this change is for.";
    if (!proposed_details) errs.proposed_details = "Proposed details are required. Describe what should change.";
    formDraft = { content_id, proposed_details };
    if (Object.keys(errs).length) {
      submitForm(errs);
      (errs.content_id ? $("#content_id") : $("#proposed_details")).focus();
      return;
    }
    // INSERT INTO update_request ... (request_status defaults to pending, submitted_at to now)
    const id = Math.max(...db.update_request.map((r) => r.request_id)) + 1;
    db.update_request.push({ request_id: id, content_id: Number(content_id), submitted_by_staff_id: me().staff_id,
      reviewed_by_staff_id: null, proposed_details, request_status: "pending", submitted_at: new Date(), reviewed_at: null });
    const c = item(Number(content_id));
    if (c.status === "current" || c.status === "needs_update") c.status = "pending_review";
    formDraft = null;
    location.hash = `#confirm-${id}`;
  });
}

// ---------- Screen 3: confirmation ----------
function confirmation(id) {
  if (role !== "lead") return denied("program lead");
  const r = req(id); if (!r) return notFound();
  const c = item(r.content_id), owner = staff(c.owner_staff_id);
  frame(3, "Request confirmation", `
    ${alertHtml({ type: "success", html: `<b>Request #${r.request_id} submitted.</b> ${esc(owner.full_name)} will review it.` })}
    <div class="card">
      <h1>Request #${r.request_id}</h1>
      <dl class="dl" style="margin-top:14px">
        <dt>Status</dt><dd>${badge(r.request_status)}</dd>
        <dt>Content item</dt><dd>${esc(c.title)} <span class="muted">(${page(c.page_id).page_slug})</span></dd>
        <dt>Item status</dt><dd>${badge(c.status)}</dd>
        <dt>Content owner</dt><dd>${esc(owner.full_name)}</dd>
        <dt>Submitted</dt><dd>${fmtDateTime(r.submitted_at)}</dd>
        <dt>Proposed details</dt><dd>${esc(r.proposed_details)}</dd>
      </dl>
      <div class="actions"><a class="btn btn-primary" href="#my-requests">View my requests</a>
        <a class="btn btn-secondary" href="#submit">Submit another</a></div>
    </div>`);
}

// ---------- Screen 4: my requests ----------
function myRequests() {
  if (role !== "lead") return denied("program lead");
  const rows = db.update_request.filter((r) => r.submitted_by_staff_id === me().staff_id)
    .sort((a, b) => b.submitted_at - a.submitted_at);
  frame(4, "My requests", `
    <h1>My update requests</h1>
    <p class="lead">Requests you submitted and where each one stands.</p>
    <div class="card"><div class="table-wrap">
      ${rows.length ? `<table><thead><tr><th>#</th><th>Content item</th><th>Submitted</th><th>Status</th><th>Reviewed</th></tr></thead><tbody>
      ${rows.map((r) => { const c = item(r.content_id); return `<tr>
        <td>#${r.request_id}</td><td><b>${esc(c.title)}</b><div class="muted">${esc(r.proposed_details)}</div></td>
        <td>${fmtDate(r.submitted_at)}</td><td>${badge(r.request_status)}</td>
        <td>${r.reviewed_at ? fmtDate(r.reviewed_at) + `<div class="muted">by ${esc(staff(r.reviewed_by_staff_id).full_name)}</div>` : '<span class="muted">Not yet</span>'}</td></tr>`; }).join("")}
      </tbody></table>` : `<p class="empty">You have no update requests.</p>`}
    </div></div>
    <a class="btn btn-primary" href="#submit">Submit an update request</a>`);
}

// ---------- Screen 5: review queue with filter ----------
function queue(params) {
  if (role !== "owner") return denied("content owner");
  const status = params.get("status") || "pending";
  const flashNow = flash; flash = null;
  const mine = db.update_request.filter((r) => item(r.content_id).owner_staff_id === me().staff_id);
  const rows = mine.filter((r) => status === "all" || r.request_status === status)
    .sort((a, b) => a.submitted_at - b.submitted_at);
  const opt = (v, t) => `<option value="${v}"${v === status ? " selected" : ""}>${t} (${v === "all" ? mine.length : mine.filter((r) => r.request_status === v).length})</option>`;
  frame(5, "Review queue with status filter", `
    ${alertHtml(flashNow)}
    <h1>Review queue</h1>
    <p class="lead">Update requests for content you own. Oldest requests are listed first.</p>
    <div class="card">
      <div class="toolbar"><div class="field"><label for="status-filter">Filter by status</label>
        <select id="status-filter">${opt("pending", "Pending")}${opt("approved", "Approved")}${opt("rejected", "Rejected")}${opt("all", "All statuses")}</select></div>
        <span class="count" aria-live="polite">${rows.length} request${rows.length === 1 ? "" : "s"}</span></div>
      <div class="table-wrap">${rows.length ? `<table><thead><tr><th>#</th><th>Content item</th><th>Submitted by</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>
      ${rows.map((r) => { const c = item(r.content_id); return `<tr>
        <td>#${r.request_id}</td><td><b>${esc(c.title)}</b><div class="muted">${page(c.page_id).page_slug}</div></td>
        <td>${esc(staff(r.submitted_by_staff_id).full_name)}</td><td>${fmtDate(r.submitted_at)}<div class="muted">${daysSince(r.submitted_at)} days ago</div></td>
        <td>${badge(r.request_status)}</td><td><a class="btn btn-secondary btn-sm" href="#request-${r.request_id}">${r.request_status === "pending" ? "Review" : "View"}</a></td></tr>`; }).join("")}
      </tbody></table>` : `<p class="empty">No requests with this status.</p>`}</div>
    </div>`);
  $("#status-filter").addEventListener("change", (e) => { location.hash = `#queue-${e.target.value}`; });
}

// ---------- Screen 6: request detail (approve / reject) ----------
function requestDetail(id, errors = {}) {
  if (role !== "owner") return denied("content owner");
  const r = req(id); if (!r) return notFound();
  const c = item(r.content_id);
  if (c.owner_staff_id !== me().staff_id) return denied("content owner of this item");
  const f = flash; flash = null;
  const reviewed = r.request_status !== "pending";
  frame(6, reviewed ? "Reviewed request detail" : "Request detail", `
    ${alertHtml(f)}
    <p><a href="#queue">← Back to review queue</a></p>
    <div class="card">
      <h1>Request #${r.request_id}: ${esc(c.title)}</h1>
      <dl class="dl" style="margin:14px 0 18px">
        <dt>Request status</dt><dd>${badge(r.request_status)}</dd>
        <dt>Submitted by</dt><dd>${esc(staff(r.submitted_by_staff_id).full_name)} · ${fmtDateTime(r.submitted_at)}</dd>
        <dt>Page</dt><dd>${esc(page(c.page_id).page_title)} (${page(c.page_id).page_slug})</dd>
        <dt>Content status</dt><dd>${badge(c.status)} <span class="muted">Last reviewed ${fmtDate(c.last_reviewed_date)}</span></dd>
        ${reviewed ? `<dt>Reviewed by</dt><dd>${esc(staff(r.reviewed_by_staff_id).full_name)} · ${fmtDateTime(r.reviewed_at)}</dd>` : ""}
      </dl>
      <div class="compare">
        <div class="box"><h3>${reviewed && r.request_status === "approved" ? "Published text" : "Current website text"}</h3>${esc(c.body)}</div>
        <div class="box proposed"><h3>Proposed details</h3>${esc(r.proposed_details)}</div>
      </div>
      ${reviewed ? (f ? "" : `<div class="alert alert-info" role="status">This request has already been reviewed.</div>`) : `
      <form id="review-form" novalidate>
        <div class="field${errors.body ? " has-error" : ""}">
          <label for="new_body">Updated website text</label>
          <p class="hint" id="body-hint">Edit the text so it reflects the proposed details. This replaces the current text when you approve.</p>
          <textarea id="new_body" aria-describedby="body-hint${errors.body ? " body-err" : ""}"${errors.body ? ' aria-invalid="true"' : ""}>${esc(errors.draft ?? c.body)}</textarea>
          ${errors.body ? `<p class="error-text" id="body-err">⚠ ${errors.body}</p>` : ""}
        </div>
        <div class="actions"><button class="btn btn-primary" type="submit" value="approve">Approve and publish</button>
          <button class="btn btn-danger" type="button" id="reject">Reject</button></div>
      </form>`}
    </div>`);
  if (reviewed) return;
  $("#review-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const body = $("#new_body").value.trim();
    if (!body || body === c.body) {
      requestDetail(id, { body: body ? "The text has not changed. Update it to match the proposed details before approving." : "Website text cannot be empty.", draft: body });
      $("#new_body").focus(); return;
    }
    // UPDATE update_request + UPDATE content_item (one transaction in Assignment 7)
    Object.assign(r, { request_status: "approved", reviewed_by_staff_id: me().staff_id, reviewed_at: new Date() });
    Object.assign(c, { body, status: "current", last_reviewed_date: today() });
    flash = { type: "success", html: `<b>Request #${r.request_id} approved.</b> “${esc(c.title)}” is updated on ${page(c.page_id).page_slug} and its review date is reset to today.` };
    requestDetail(id); $("#main").focus();
  });
  $("#reject").addEventListener("click", () => {
    Object.assign(r, { request_status: "rejected", reviewed_by_staff_id: me().staff_id, reviewed_at: new Date() });
    if (!db.update_request.some((x) => x.content_id === c.content_id && x.request_status === "pending") && c.status === "pending_review") c.status = "current";
    flash = { type: "success", html: `<b>Request #${r.request_id} rejected.</b> The website text was not changed.` };
    requestDetail(id); $("#main").focus();
  });
}

// ---------- Screen 7: my content + archive ----------
function content(params) {
  if (role !== "owner") return denied("content owner");
  const view = params.get("view") || "attention";
  const f = flash; flash = null;
  const mine = db.content_item.filter((c) => c.owner_staff_id === me().staff_id);
  const tests = {
    attention: (c) => c.status === "needs_update" || c.status === "pending_review" || (c.status !== "archived" && daysSince(c.last_reviewed_date) > 90),
    overdue: (c) => c.status !== "archived" && daysSince(c.last_reviewed_date) > 90,
    live: (c) => c.status !== "archived",
    archived: (c) => c.status === "archived",
    all: () => true
  };
  const rows = mine.filter(tests[view]).sort((a, b) => a.last_reviewed_date - b.last_reviewed_date);
  const opt = (v, t) => `<option value="${v}"${v === view ? " selected" : ""}>${t} (${mine.filter(tests[v]).length})</option>`;
  frame(7, "My content and archiving", `
    ${alertHtml(f)}
    <h1>My content</h1>
    <p class="lead">Website content you are responsible for. Archiving removes an item from the public site but keeps its record.</p>
    <div class="card">
      <div class="toolbar"><div class="field"><label for="view-filter">Show</label>
        <select id="view-filter">${opt("attention", "Needs attention")}${opt("overdue", "Not reviewed in 90+ days")}${opt("live", "All live content")}${opt("archived", "Archived")}${opt("all", "Everything")}</select></div>
        <span class="count" aria-live="polite">${rows.length} item${rows.length === 1 ? "" : "s"}</span></div>
      <div class="table-wrap">${rows.length ? `<table><thead><tr><th>Content item</th><th>Page</th><th>Status</th><th>Last reviewed</th><th>Public</th><th></th></tr></thead><tbody>
      ${rows.map((c) => `<tr><td><b>${esc(c.title)}</b><div class="muted">${esc(c.body)}</div></td>
        <td>${page(c.page_id).page_slug}</td><td>${badge(c.status)}</td>
        <td>${fmtDate(c.last_reviewed_date)}<div class="muted"${daysSince(c.last_reviewed_date) > 90 && c.status !== "archived" ? ' style="color:var(--red-700);font-weight:600"' : ""}>${daysSince(c.last_reviewed_date)} days ago</div></td>
        <td>${c.is_published ? "Yes" : "No"}</td>
        <td>${c.status === "archived" ? "" : c.status === "pending_review"
          ? '<span class="muted">Review pending request first</span>'
          : `<button class="btn btn-danger btn-sm" data-archive="${c.content_id}">Archive</button>`}</td></tr>`).join("")}
      </tbody></table>` : `<p class="empty">No content in this view.</p>`}</div>
    </div>`);
  $("#view-filter").addEventListener("change", (e) => { location.hash = `#content-${e.target.value}`; });
  document.querySelectorAll("[data-archive]").forEach((b) => b.addEventListener("click", () => {
    const c = item(Number(b.dataset.archive));
    // UPDATE content_item SET status = 'archived', is_published = FALSE (row is kept)
    Object.assign(c, { status: "archived", is_published: false });
    flash = { type: "success", html: `<b>“${esc(c.title)}” archived.</b> It no longer appears on the public ${page(c.page_id).page_title} page (${page(c.page_id).page_slug}). The record is kept below.` };
    const target = "#content-all";
    if (location.hash === target) { content(new URLSearchParams("view=all")); $("#main").focus(); }
    else location.hash = target;
  }));
}

// ---------- Screen 8: public page ----------
function publicPage(slugKey) {
  const slug = slugKey === "home" ? "/" : "/" + slugKey;
  const p = db.web_page.find((x) => x.page_slug === slug); if (!p) return notFound();
  // SELECT ... WHERE is_published = TRUE AND status <> 'archived'
  const items = db.content_item.filter((c) => c.page_id === p.page_id && c.is_published && c.status !== "archived");
  frame(8, `Public page: ${p.page_title}`, `
    <div class="hero"><h1>${esc(p.page_title)}</h1><p>Wellspring on Main · a home for community programs, nonprofits, and events</p></div>
    ${items.length ? `<div class="public-grid">${items.map((c) => `<article class="public-card"><h2>${esc(c.title)}</h2><p>${esc(c.body)}</p>
      <div class="audiences">${audiencesFor(c.content_id).map((a) => `<span class="aud">${esc(a)}</span>`).join("")}</div></article>`).join("")}</div>`
      : `<div class="card empty">There is no current information on this page yet.</div>`}`);
}

function notFound() { frame("—", "Not found", `<div class="card"><h1>Page not found</h1><a href="${ROLES[role].start}">Go back</a></div>`); }

// ---------- router ----------
// Plain hash names (#submit, #queue-approved, #request-2, #page-programs) so links work in the artifact viewer.
function route() {
  const h = location.hash.slice(1);
  let m;
  if (h === "submit") return submitForm();
  if ((m = h.match(/^confirm-(\d+)$/))) return confirmation(Number(m[1]));
  if (h === "my-requests") return myRequests();
  if ((m = h.match(/^queue(?:-(\w+))?$/))) return queue(new URLSearchParams(m[1] ? "status=" + m[1] : ""));
  if ((m = h.match(/^request-(\d+)$/))) return requestDetail(Number(m[1]));
  if ((m = h.match(/^content(?:-(\w+))?$/))) return content(new URLSearchParams(m[1] ? "view=" + m[1] : ""));
  if ((m = h.match(/^page-([\w-]+)$/))) { role = "visitor"; return publicPage(m[1]); }
  location.hash = ROLES[role].start;
}
window.addEventListener("hashchange", () => { route(); window.scrollTo(0, 0); });
route();
