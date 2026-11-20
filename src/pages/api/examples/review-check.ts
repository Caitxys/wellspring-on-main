import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * EXAMPLE ONLY — copy this pattern into your real routes, then delete this file.
 *
 * POST /api/examples/review-check
 *   Signed out                       -> 401
 *   Signed in, role can't review     -> 403
 *   Signed in as a Content Owner     -> 200
 *
 * A real "approve request" route needs more checks after this one:
 *   - validate the input (400 if missing or invalid)
 *   - load the request and its content item
 *   - confirm content_item.owner_staff_id === staff.staff_id (Business Rule 6)
 *   - confirm the request is still 'pending'
 *   - then save, and return a clear success message
 */
export const POST: APIRoute = ({ locals }) => {
  const staff = requirePermission(locals, 'review_request');
  if (staff instanceof Response) return staff;

  return json(200, {
    message: `${staff.full_name} is allowed to review requests.`,
  });
};
