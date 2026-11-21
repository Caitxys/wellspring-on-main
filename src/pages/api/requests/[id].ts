import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * PATCH /api/requests/:id — the content item's owner approves or rejects a request.
 * Body (JSON): { decision: 'approved' | 'rejected', new_body?: string }
 * When approving, new_body is the updated website text for the content item.
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
  // 1. Signed in, and a role that may review? (401 / 403)
  const staff = requirePermission(locals, 'review_request');
  if (staff instanceof Response) return staff;

  // 2. Read and check the input. (400)
  const requestId = Number(params.id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return json(400, { error: 'That is not a valid request number.' });
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Send the review as JSON.' });
  }

  const decision = String(input.decision ?? '');
  const newBody = String(input.new_body ?? '').trim();
  const errors: Record<string, string> = {};

  if (decision !== 'approved' && decision !== 'rejected') {
    errors.decision = 'Choose Approve or Reject.';
  }
  if (decision === 'approved' && newBody.length < 10) {
    errors.new_body = 'Enter the updated website text (at least 10 characters).';
  }
  if (Object.keys(errors).length > 0) {
    return json(400, { error: 'Please fix the fields below.', errors });
  }

  // 3. Load the request and its content item. (404)
  const { data: req } = await locals.supabase
    .from('update_request')
    .select('request_id, request_status, content_id, content_item(owner_staff_id, title)')
    .eq('request_id', requestId)
    .maybeSingle();

  if (!req) {
    return json(404, { error: `Request #${requestId} was not found.` });
  }

  // 4. Business Rule 6: only the owner of this content item may review it. (403)
  const item = req.content_item as unknown as { owner_staff_id: number; title: string };
  if (item.owner_staff_id !== staff.staff_id) {
    return json(403, { error: 'Only the owner of this content item can review this request.' });
  }

  // 5. Only pending requests can be reviewed. (409)
  if (req.request_status !== 'pending') {
    return json(409, { error: `This request was already ${req.request_status}.` });
  }

  // 6. Save the decision. Business Rule 5: record who reviewed it and when.
  const { data: saved, error: reviewError } = await locals.supabase
    .from('update_request')
    .update({
      request_status: decision,
      reviewed_by_staff_id: staff.staff_id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('request_id', requestId)
    .eq('request_status', 'pending')
    .select('request_id');

  if (reviewError || !saved || saved.length === 0) {
    console.error('Saving the review failed:', reviewError ?? 'no rows updated (check RLS policies)');
    return json(500, { error: 'The review could not be saved. Please try again.' });
  }

  // 7. If approved, update the website text too.
  if (decision === 'approved') {
    const { data: updated, error: contentError } = await locals.supabase
      .from('content_item')
      .update({
        body: newBody,
        status: 'current',
        last_reviewed_date: new Date().toISOString().slice(0, 10),
      })
      .eq('content_id', req.content_id)
      .select('content_id');

    if (contentError || !updated || updated.length === 0) {
      console.error('Updating content_item failed:', contentError ?? 'no rows updated (check RLS policies)');
      return json(500, { error: 'The request was approved, but the website text could not be updated.' });
    }
  }

  return json(200, {
    message:
      decision === 'approved'
        ? `Request #${requestId} approved. "${item.title}" now shows the new text.`
        : `Request #${requestId} rejected.`,
  });
};
