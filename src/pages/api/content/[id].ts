import type { APIRoute } from 'astro';
import { json, requirePermission } from '../../../lib/http';

export const prerender = false;

/**
 * PATCH /api/content/:id — the item's owner archives a content item.
 * Body (JSON): { action: 'archive' }
 * Archived items are taken off the public site (Business Rule 9).
 */
export const PATCH: APIRoute = async ({ locals, params, request }) => {
  // 1. Signed in, and a role that may archive? (401 / 403)
  const staff = requirePermission(locals, 'archive_content');
  if (staff instanceof Response) return staff;

  // 2. Check the input. (400)
  const contentId = Number(params.id);
  if (!Number.isInteger(contentId) || contentId <= 0) {
    return json(400, { error: 'That is not a valid content item number.' });
  }

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return json(400, { error: 'Send the action as JSON.' });
  }
  if (input.action !== 'archive') {
    return json(400, { error: 'The only supported action is "archive".' });
  }

  // 3. Load the item. (404)
  const { data: item } = await locals.supabase
    .from('content_item')
    .select('content_id, title, status, owner_staff_id')
    .eq('content_id', contentId)
    .maybeSingle();

  if (!item) {
    return json(404, { error: `Content item #${contentId} was not found.` });
  }

  // 4. Only the owner may archive it. (403)
  if (item.owner_staff_id !== staff.staff_id) {
    return json(403, { error: 'Only the owner of this content item can archive it.' });
  }

  // 5. Conflicts. (409)
  if (item.status === 'archived') {
    return json(409, { error: `"${item.title}" is already archived.` });
  }
  const { count } = await locals.supabase
    .from('update_request')
    .select('request_id', { count: 'exact', head: true })
    .eq('content_id', contentId)
    .eq('request_status', 'pending');

  if ((count ?? 0) > 0) {
    return json(409, {
      error: `"${item.title}" has a pending update request. Approve or reject it before archiving.`,
    });
  }

  // 6. Archive: set the status and take it off the public site.
  const { data: saved, error } = await locals.supabase
    .from('content_item')
    .update({ status: 'archived', is_published: false })
    .eq('content_id', contentId)
    .select('content_id');

  if (error || !saved || saved.length === 0) {
    console.error('Archiving content_item failed:', error ?? 'no rows updated (check RLS policies)');
    return json(500, { error: 'The item could not be archived. Please try again.' });
  }

  return json(200, { message: `"${item.title}" was archived and removed from the public site.` });
};