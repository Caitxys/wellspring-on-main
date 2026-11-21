import { c as can } from './auth_CHY3ww-v.mjs';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
function requireStaff(locals) {
  if (!locals.user) {
    return json(401, { error: "Please sign in to continue." });
  }
  if (!locals.staff) {
    return json(403, { error: "This account is not linked to a Wellspring staff member." });
  }
  return locals.staff;
}
function requirePermission(locals, permission) {
  const staff = requireStaff(locals);
  if (staff instanceof Response) return staff;
  if (!can(staff, permission)) {
    return json(403, { error: `Your role (${staff.role}) does not allow this action.` });
  }
  return staff;
}

export { requireStaff as a, json as j, requirePermission as r };
