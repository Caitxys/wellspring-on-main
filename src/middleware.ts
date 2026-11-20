import { defineMiddleware } from 'astro:middleware';
import { createSupabase } from './lib/supabase';

/**
 * Runs on every server-rendered page and API route.
 *
 * Looks up who is signed in and stores it on `locals`:
 *   locals.supabase  a client that acts as this user (RLS applies)
 *   locals.user      the Supabase Auth user, or null
 *   locals.staff     the matching staff row (id, name, role), or null
 *
 * The role always comes from the database, never from the browser.
 * Each page/route then decides what that role may do (see src/lib/auth.ts).
 */
export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();

  const supabase = createSupabase(context.request, context.cookies);
  context.locals.supabase = supabase;
  context.locals.user = null;
  context.locals.staff = null;

  // getUser() checks the session with Supabase Auth instead of trusting the cookie.
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    context.locals.user = data.user;
    const { data: staff } = await supabase
      .from('staff')
      .select('staff_id, full_name, email, role')
      .eq('auth_user_id', data.user.id)
      .maybeSingle();
    context.locals.staff = staff ?? null;
  }

  return next();
});
