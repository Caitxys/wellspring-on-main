import { e as createComponent, l as renderComponent, o as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, p as Fragment, g as addAttribute } from '../../chunks/astro/server_DA7puEs0.mjs';
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
  const allowed = can(staff, "archive_content");
  if (!allowed) Astro2.response.status = 403;
  const show = Astro2.url.searchParams.get("show") ?? "active";
  let query = Astro2.locals.supabase.from("content_item").select(
    `content_id, title, status, is_published, last_reviewed_date,
     web_page ( page_title ),
     content_audience ( audience ( audience_name ) )`
  ).eq("owner_staff_id", staff.staff_id);
  if (show === "active") query = query.neq("status", "archived");
  if (show === "archived") query = query.eq("status", "archived");
  const { data: items, error } = allowed ? await query.order("title") : { data: [], error: null };
  if (error) console.error("Loading content failed:", error);
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": "My content" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<p><a href="/staff">← Staff home</a></p> <h1>My content</h1> ${!allowed ? renderTemplate`<div class="alert alert-error">Only Content Owners can manage content items.</div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div id="form-message" role="status" aria-live="polite"></div> <form method="get" class="toolbar"> <div class="field"> <label for="show">Show</label> <select id="show" name="show"> <option value="active"${addAttribute(show === "active", "selected")}>Active (not archived)</option> <option value="archived"${addAttribute(show === "archived", "selected")}>Archived</option> <option value="all"${addAttribute(show === "all", "selected")}>Everything</option> </select> </div> <button type="submit" class="btn btn-secondary btn-sm">Apply</button> </form> ${error && renderTemplate`<div class="alert alert-error">Your content could not be loaded. Check the terminal for details.</div>`}${items && items.length > 0 ? renderTemplate`<table class="data-table"> <thead> <tr> <th>Title (page)</th> <th>Audiences</th> <th>Status</th> <th>Published</th> <th><span class="visually-hidden">Actions</span></th> </tr> </thead> <tbody> ${items.map((c) => renderTemplate`<tr> <td> ${c.title} <span class="muted">(${c.web_page?.page_title})</span> </td> <td>${(c.content_audience ?? []).map((ca) => ca.audience?.audience_name).join(", ")}</td> <td><span${addAttribute(`status status-${c.status}`, "class")}>${c.status}</span></td> <td>${c.is_published ? "Yes" : "No"}</td> <td> ${c.status !== "archived" && renderTemplate`<button type="button" class="btn btn-secondary btn-sm archive-btn"${addAttribute(c.content_id, "data-id")}${addAttribute(c.title, "data-title")}>
Archive
</button>`} </td> </tr>`)} </tbody> </table>` : !error && renderTemplate`<p class="alert alert-info">No matching content.</p>`}` })}`}` })} ${renderScript($$result, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/content/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/content/index.astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/content/index.astro";
const $$url = "/staff/content";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
