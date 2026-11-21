import { r as requirePermission, j as json } from '../../../chunks/http_CD72WQX6.mjs';
export { renderers } from '../../../renderers.mjs';

const prerender = false;
const PATCH = async ({ locals, params, request }) => {
  const staff = requirePermission(locals, "archive_content");
  if (staff instanceof Response) return staff;
  const contentId = Number(params.id);
  if (!Number.isInteger(contentId) || contentId <= 0) {
    return json(400, { error: "That is not a valid content item number." });
  }
  let input;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: "Send the action as JSON." });
  }
  if (input.action !== "archive") {
    return json(400, { error: 'The only supported action is "archive".' });
  }
  const { data: item } = await locals.supabase.from("content_item").select("content_id, title, status, owner_staff_id").eq("content_id", contentId).maybeSingle();
  if (!item) {
    return json(404, { error: `Content item #${contentId} was not found.` });
  }
  if (item.owner_staff_id !== staff.staff_id) {
    return json(403, { error: "Only the owner of this content item can archive it." });
  }
  if (item.status === "archived") {
    return json(409, { error: `"${item.title}" is already archived.` });
  }
  const { count } = await locals.supabase.from("update_request").select("request_id", { count: "exact", head: true }).eq("content_id", contentId).eq("request_status", "pending");
  if ((count ?? 0) > 0) {
    return json(409, {
      error: `"${item.title}" has a pending update request. Approve or reject it before archiving.`
    });
  }
  const { data: saved, error } = await locals.supabase.from("content_item").update({ status: "archived", is_published: false }).eq("content_id", contentId).select("content_id");
  if (error || !saved || saved.length === 0) {
    console.error("Archiving content_item failed:", error ?? "no rows updated (check RLS policies)");
    return json(500, { error: "The item could not be archived. Please try again." });
  }
  return json(200, { message: `"${item.title}" was archived and removed from the public site.` });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  PATCH,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
