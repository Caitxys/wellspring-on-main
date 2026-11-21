import { r as requirePermission, j as json } from '../../../chunks/http_CD72WQX6.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const PATCH = async ({ locals, params, request }) => {
  const staff = requirePermission(locals, "review_request");
  if (staff instanceof Response) return staff;
  const requestId = Number(params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return json(400, { error: "That is not a valid request number." });
  }
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: "Send the review as JSON." });
  }
  const decision = String(input.decision ?? "");
  const newBody = String(input.new_body ?? "").trim();
  const errors = {};
  if (decision !== "approved" && decision !== "rejected") {
    errors.decision = "Choose Approve or Reject.";
  }
  if (decision === "approved" && newBody.length < 10) {
    errors.new_body = "Enter the updated website text (at least 10 characters).";
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: "Please fix the fields below.", errors });
  }
  const { data: req } = await locals.supabase.from("update_request").select("request_id, request_status, content_id, content_item(owner_staff_id, title)").eq("request_id", requestId).maybeSingle();
  if (!req) {
    return json(404, { error: `Request #${requestId} was not found.` });
  }
  const item = req.content_item;
  if (item.owner_staff_id !== staff.staff_id) {
    return json(403, { error: "Only the owner of this content item can review this request." });
  }
  if (req.request_status !== "pending") {
    return json(409, { error: `This request was already ${req.request_status}.` });
  }
  const { data: saved, error: reviewError } = await locals.supabase.from("update_request").update({
    request_status: decision,
    reviewed_by_staff_id: staff.staff_id,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("request_id", requestId).eq("request_status", "pending").select("request_id");
  if (reviewError || !saved || saved.length === 0) {
    console.error("Saving the review failed:", reviewError ?? "no rows updated (check RLS policies)");
    return json(500, { error: "The review could not be saved. Please try again." });
  }
  if (decision === "approved") {
    const { data: updated, error: contentError } = await locals.supabase.from("content_item").update({
      body: newBody,
      status: "current",
      last_reviewed_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    }).eq("content_id", req.content_id).select("content_id");
    if (contentError || !updated || updated.length === 0) {
      console.error("Updating content_item failed:", contentError ?? "no rows updated (check RLS policies)");
      return json(500, { error: "The request was approved, but the website text could not be updated." });
    }
  }
  return json(200, {
    message: decision === "approved" ? `Request #${requestId} approved. "${item.title}" now shows the new text.` : `Request #${requestId} rejected.`
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
