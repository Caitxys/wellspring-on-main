import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * POST /api/requests — a Programs Lead or Events Lead submits an update request.
 * Body (JSON): { content_id: number, proposed_details: string }
 */
export const POST: APIRoute = async ({ locals, request }) => {
  // 1. Who is asking, and does their role allow this? (401 / 403)
  const staff = requirePermission(locals, 'submit_request');
  if (staff instanceof Response) return staff;

  // 2. Read what was sent.
  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Send the form data as JSON.' });
  }

  // 3. Check every required field. Collect all problems at once.
  const contentId = Number(input.content_id);
  const details = String(input.proposed_details ?? '').trim();
  const errors: Record<string, string> = {};

  if (!Number.isInteger(contentId) || contentId <= 0) {
    errors.content_id = 'Choose the content item to update.';
  }
  if (details === '') {
    errors.proposed_details = 'Proposed details are required.';
  } else if (details.length < 10) {
    errors.proposed_details = 'Describe the change in at least 10 characters.';
  } else if (details.length > 2000) {
    errors.proposed_details = 'Keep the proposed details under 2,000 characters.';
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: 'Please fix the fields below.', errors });
  }

  // 4. Make sure the content item exists and is not archived.
  const { data: item } = await locals.supabase
    .from('content_item')
    .select('content_id, title, status')
    .eq('content_id', contentId)
    .maybeSingle();

  if (!item) {
    return json(400, { error: 'That content item does not exist.', errors: { content_id: 'Choose an item from the list.' } });
  }
  if (item.status === 'archived') {
    return json(400, { error: 'Archived content cannot be updated.', errors: { content_id: 'Choose an item that is not archived.' } });
  }

  // 5. Save. The submitter comes from the signed-in staff member, never from the browser.
  const { data, error } = await locals.supabase
    .from('update_request')
    .insert({
      content_id: contentId,
      submitted_by_staff_id: staff.staff_id,
      proposed_details: details,
    })
    .select('request_id, request_status')
    .single();

  if (error) {
    console.error('Saving update_request failed:', error);
    return json(500, { error: 'The request could not be saved. Please try again.' });
  }

  // 6. Clear confirmation.
  return json(201, {
    message: `Request #${data.request_id} was submitted for "${item.title}". Status: ${data.request_status}.`,
    request: data,
  });
};