import { e as createComponent, l as renderComponent, o as renderScript, r as renderTemplate, h as createAstro, m as maybeRenderHead, p as Fragment, g as addAttribute } from '../../../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import { $ as $$StaffLayout } from '../../../chunks/StaffLayout_Dbp9_nrD.mjs';
import { c as can } from '../../../chunks/auth_CHY3ww-v.mjs';
import { r as requireStaffPage } from '../../../chunks/page-guard_Y-XwZHc0.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const staff = requireStaffPage(Astro2);
  if (staff instanceof Response) return staff;
  const requestId = Number(Astro2.params.id);
  const { data: r, error } = await Astro2.locals.supabase.from("update_request").select(
    `request_id, request_status, proposed_details, submitted_at, reviewed_at,
     content_item ( content_id, title, body, owner_staff_id, web_page ( page_title ),
                    owner:staff!owner_staff_id ( full_name ) ),
     submitter:staff!submitted_by_staff_id ( full_name ),
     reviewer:staff!reviewed_by_staff_id ( full_name )`
  ).eq("request_id", requestId).maybeSingle();
  if (error) console.error("Loading request failed:", error);
  if (!r) Astro2.response.status = 404;
  const req = r;
  const canReview = !!req && can(staff, "review_request") && req.content_item?.owner_staff_id === staff.staff_id && req.request_status === "pending";
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": req ? `Request #${req.request_id}` : "Request not found" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<p><a href="/staff/requests">← All requests</a></p> ${!req ? renderTemplate`<div class="alert alert-error">This request does not exist, or you do not have access to it.</div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h1>Request #${req.request_id}: ${req.content_item?.title}</h1> <section class="panel"> <p><strong>Page:</strong> ${req.content_item?.web_page?.page_title}</p> <p><strong>Content owner:</strong> ${req.content_item?.owner?.full_name}</p> <p><strong>Submitted by:</strong> ${req.submitter?.full_name} on ${new Date(req.submitted_at).toLocaleString()}</p> <p><strong>Status:</strong> <span${addAttribute(`status status-${req.request_status}`, "class")}>${req.request_status}</span> ${req.reviewer && renderTemplate`${renderComponent($$result3, "Fragment", Fragment, {}, { "default": async ($$result4) => renderTemplate` (by ${req.reviewer.full_name})` })}`} </p> <h2>Proposed details</h2> <p>${req.proposed_details}</p> <h2>Current website text</h2> <p>${req.content_item?.body}</p> </section> ${canReview && renderTemplate`<form id="review-form" class="panel"${addAttribute(req.request_id, "data-request-id")} novalidate> <h2>Review this request</h2> <div id="form-message" role="status" aria-live="polite"></div> <div class="field"> <label for="new_body">Updated website text (required to approve)</label> <textarea id="new_body" name="new_body" rows="5">${req.content_item?.body}</textarea> <p class="field-error" data-error-for="new_body"></p> </div> <p class="field-error" data-error-for="decision"></p> <div class="button-row"> <button type="submit" name="decision" value="approved" class="btn btn-primary">Approve and publish</button> <button type="submit" name="decision" value="rejected" class="btn btn-secondary">Reject</button> </div> </form>`}` })}`}` })} ${renderScript($$result, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/[id].astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/[id].astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/requests/[id].astro";
const $$url = "/staff/requests/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
