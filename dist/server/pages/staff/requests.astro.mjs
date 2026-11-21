import { e as createComponent, l as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import { $ as $$StaffLayout } from '../../chunks/StaffLayout_Dbp9_nrD.mjs';
import { c as can } from '../../chunks/auth_CHY3ww-v.mjs';
import { r as requireStaffPage } from '../../chunks/page-guard_Y-XwZHc0.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const staff = requireStaffPage(Astro2);
  if (staff instanceof Response) return staff;
  const STATUSES = ["pending", "approved", "rejected"];
  const status = Astro2.url.searchParams.get("status") ?? "all";
  let query = Astro2.locals.supabase.from("update_request").select(
    `request_id, request_status, proposed_details, submitted_at,
     content_item!inner ( content_id, title, owner_staff_id, web_page ( page_title ) ),
     submitter:staff!submitted_by_staff_id ( full_name )`
  );
  if (!can(staff, "view_all_requests")) {
    if (can(staff, "review_request")) {
      query = query.eq("content_item.owner_staff_id", staff.staff_id);
    } else {
      query = query.eq("submitted_by_staff_id", staff.staff_id);
    }
  }
  if (STATUSES.includes(status)) {
    query = query.eq("request_status", status);
  }
  const { data: requests, error } = await query.order("submitted_at", { ascending: false });
  if (error) console.error("Loading requests failed:", error);
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": "Update requests" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<p><a href="/staff">← Staff home</a></p> <h1>Update requests</h1> <form method="get" class="toolbar"> <div class="field"> <label for="status">Filter by status</label> <select id="status" name="status"> <option value="all"${addAttribute(status === "all", "selected")}>All</option> ${STATUSES.map((s) => renderTemplate`<option${addAttribute(s, "value")}${addAttribute(status === s, "selected")}>${s}</option>`)} </select> </div> <button type="submit" class="btn btn-secondary btn-sm">Apply</button> </form> ${error && renderTemplate`<div class="alert alert-error">The requests could not be loaded. Check the terminal for details.</div>`}${requests && requests.length > 0 ? renderTemplate`<table class="data-table"> <thead> <tr> <th>#</th> <th>Content (page)</th> <th>Submitted by</th> <th>Status</th> <th>Submitted</th> </tr> </thead> <tbody> ${requests.map((r) => renderTemplate`<tr> <td><a${addAttribute(`/staff/requests/${r.request_id}`, "href")}>#${r.request_id}</a></td> <td> ${r.content_item?.title} <span class="muted">(${r.content_item?.web_page?.page_title})</span> </td> <td>${r.submitter?.full_name}</td> <td><span${addAttribute(`status status-${r.request_status}`, "class")}>${r.request_status}</span></td> <td>${new Date(r.submitted_at).toLocaleDateString()}</td> </tr>`)} </tbody> </table>` : !error && renderTemplate`<p class="alert alert-info">No matching requests.</p>`}` })}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/index.astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/index.astro";
const $$url = "/staff/requests";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
