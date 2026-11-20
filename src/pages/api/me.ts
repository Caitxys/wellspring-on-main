import type { APIRoute } from 'astro';
import { permissionsFor } from '../../lib/auth';
import { json, requireStaff } from '../../lib/http';

export const prerender = false;

/**
 * GET /api/me — who is signed in, their role, and what they may do.
 * Signed out: 401. Signed in but not linked to staff: 403.
 */
export const GET: APIRoute = ({ locals }) => {
  const staff = requireStaff(locals);
  if (staff instanceof Response) return staff;

  return json(200, { staff, permissions: permissionsFor(staff) });
};
