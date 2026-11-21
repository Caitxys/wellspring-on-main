import { e as createComponent, l as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, p as Fragment } from '../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import { $ as $$StaffLayout } from '../chunks/StaffLayout_Dbp9_nrD.mjs';
import { p as permissionsFor, P as PERMISSIONS, c as can } from '../chunks/auth_CHY3ww-v.mjs';
import { r as requireStaffPage } from '../chunks/page-guard_Y-XwZHc0.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const staff = requireStaffPage(Astro2);
  if (staff instanceof Response) return staff;
  const mine = permissionsFor(staff);
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": "Staff home" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<h1>Welcome, ${staff.full_name}</h1> <p>You are signed in as <strong>${staff.role}</strong>.</p> <section class="panel"> <h2>What your role allows</h2> <ul> ${Object.keys(PERMISSIONS).map((p) => renderTemplate`<li> ${mine.includes(p) ? "\u2714" : "\u2718"} <code>${p}</code> </li>`)} </ul> <p>
These come from <code>src/lib/auth.ts</code>. The server checks them on every protected request, so hiding a
      link is never the only protection.
</p> </section>  <section class="panel"> <h2>Your tasks</h2> <ul class="task-list"> ${can(staff, "submit_request") && renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": ($$result3) => renderTemplate` <li><a href="/staff/requests/new">Submit an update request</a></li> <li><a href="/staff/requests">My update requests</a></li> ` })}`} ${can(staff, "review_request") && renderTemplate`<li><a href="/staff/requests?status=pending">Review queue (pending requests for my content)</a></li>`} ${can(staff, "view_all_requests") && renderTemplate`<li><a href="/staff/requests">All update requests</a></li>`} </ul> </section> ` })}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/index.astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/index.astro";
const $$url = "/staff";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
