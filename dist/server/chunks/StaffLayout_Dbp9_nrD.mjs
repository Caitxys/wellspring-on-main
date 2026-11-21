import { e as createComponent, k as renderHead, g as addAttribute, r as renderTemplate, n as renderSlot, h as createAstro } from './astro/server_DA7puEs0.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */
/* empty css                         */

const $$Astro = createAstro();
const $$StaffLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$StaffLayout;
  const { title } = Astro2.props;
  const staff = Astro2.locals.staff;
  return renderTemplate`<html lang="en"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${title} · Wellspring Staff</title>${renderHead()}</head> <body class="staff"> <header class="staff-header"> <div class="staff-wrap staff-header-row"> <a${addAttribute(staff ? "/staff" : "/", "href")} class="staff-brand">Wellspring on Main · Staff</a> ${staff && renderTemplate`<div class="who"> <span> ${staff.full_name} <span class="role-tag">${staff.role}</span> </span> <form method="post" action="/api/auth/logout"> <button type="submit" class="btn btn-secondary btn-sm">Sign out</button> </form> </div>`} </div> </header> <main class="staff-wrap staff-main"> ${renderSlot($$result, $$slots["default"])} </main> </body></html>`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/layouts/StaffLayout.astro", void 0);

export { $$StaffLayout as $ };
