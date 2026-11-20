import type { APIRoute } from 'astro';

export const prerender = false;

/** POST /api/auth/logout — ends the session and returns to the sign-in page. */
export const POST: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase.auth.signOut();
  return redirect('/login?signed_out=1', 303);
};
