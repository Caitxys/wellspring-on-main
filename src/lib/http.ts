import { can, type Permission, type Staff } from './auth';

/** Send a JSON response with a status code. */
export function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Authentication guard for API routes: is someone signed in, and are they staff?
 * Returns the staff member, or a 401/403 response to send back.
 *
 *   const staff = requireStaff(locals);
 *   if (staff instanceof Response) return staff;
 */
export function requireStaff(locals: App.Locals): Staff | Response {
  if (!locals.user) {
    return json(401, { error: 'Please sign in to continue.' });
  }
  if (!locals.staff) {
    return json(403, { error: 'This account is not linked to a Wellspring staff member.' });
  }
  return locals.staff;
}

/**
 * Authorization guard for API routes: does this staff member's role allow the action?
 * Returns the staff member, or a 401/403 response to send back.
 *
 *   const staff = requirePermission(locals, 'review_request');
 *   if (staff instanceof Response) return staff;
 */
export function requirePermission(locals: App.Locals, permission: Permission): Staff | Response {
  const staff = requireStaff(locals);
  if (staff instanceof Response) return staff;
  if (!can(staff, permission)) {
    return json(403, { error: `Your role (${staff.role}) does not allow this action.` });
  }
  return staff;
}
