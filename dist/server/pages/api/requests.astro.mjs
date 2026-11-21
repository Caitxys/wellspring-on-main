import { r as requirePermission, j as json } from '../../chunks/http_CD72WQX6.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ locals, request }) => {
  const staff = requirePermission(locals, "submit_request");
  if (staff instanceof Response) return staff;
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: "Send the form data as JSON." });
  }
  const contentId = Number(input.content_id);
  const details = String(input.proposed_details ?? "").trim();
  const errors = {};
  if (!Number.isInteger(contentId) || contentId <= 0) {
    errors.content_id = "Choose the content item to update.";
  }
  if (details === "") {
    errors.proposed_details = "Proposed details are required.";
  } else if (details.length < 10) {
    errors.proposed_details = "Describe the change in at least 10 characters.";
  } else if (details.length > 2e3) {
    errors.proposed_details = "Keep the proposed details under 2,000 characters.";
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: "Please fix the fields below.", errors });
  }
  const { data: item } = await locals.supabase.from("content_item").select("content_id, title, status").eq("content_id", contentId).maybeSingle();
  if (!item) {
    return json(400, { error: "That content item does not exist.", errors: { content_id: "Choose an item from the list." } });
  }
  if (item.status === "archived") {
    return json(400, { error: "Archived content cannot be updated.", errors: { content_id: "Choose an item that is not archived." } });
  }
  const { data, error } = await locals.supabase.from("update_request").insert({
    content_id: contentId,
    submitted_by_staff_id: staff.staff_id,
    proposed_details: details
  }).select("request_id, request_status").single();
  if (error) {
    console.error("Saving update_request failed:", error);
    return json(500, { error: "The request could not be saved. Please try again." });
  }
  return json(201, {
    message: `Request #${data.request_id} was submitted for "${item.title}". Status: ${data.request_status}.`,
    request: data
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
