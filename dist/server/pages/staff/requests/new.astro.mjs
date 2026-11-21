import { e as createComponent, l as renderComponent, o as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../../../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import { $ as $$StaffLayout } from '../../../chunks/StaffLayout_Dbp9_nrD.mjs';
import { c as can } from '../../../chunks/auth_CHY3ww-v.mjs';
import { r as requireStaffPage } from '../../../chunks/page-guard_Y-XwZHc0.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$New;
  const staff = requireStaffPage(Astro2);
  if (staff instanceof Response) return staff;
  const allowed = can(staff, "submit_request");
  if (!allowed) Astro2.response.status = 403;
  const { data: items, error } = allowed ? await Astro2.locals.supabase.from("content_item").select("content_id, title, web_page(page_title)").neq("status", "archived").order("title") : { data: [], error: null };
  if (error) console.error("Loading content items failed:", error);
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": "Submit an update request" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<p><a href="/staff">← Staff home</a></p> <h1>Submit an update request</h1> ${!allowed ? renderTemplate`<div class="alert alert-error">Only Programs Leads and Events Leads can submit update requests.</div>` : renderTemplate`<form id="request-form" class="panel" novalidate> <div id="form-message" role="status" aria-live="polite"></div> <div class="field"> <label for="content_id">Website content to update</label> <select id="content_id" name="content_id" required> <option value="">Choose a content item…</option> ${(items ?? []).map((item) => renderTemplate`<option${addAttribute(item.content_id, "value")}> ${item.title} (${item.web_page?.page_title})
</option>`)} </select> <p class="field-error" data-error-for="content_id"></p> </div> <div class="field"> <label for="proposed_details">Proposed details</label> <textarea id="proposed_details" name="proposed_details" rows="5" required></textarea> <p class="field-error" data-error-for="proposed_details"></p> </div> <button type="submit" class="btn btn-primary">Submit request</button> </form>`}` })} ${renderScript($$result, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/new.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/new.astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/new.astro";
const $$url = "/staff/requests/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
