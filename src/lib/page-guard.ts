import type { AstroGlobal } from 'astro';
import type { Staff } from './auth';

/**
 * Protected-page guard. Use at the top of every staff page:
 *
 *   const staff = requireStaffPage(Astro);
 *   if (staff instanceof Response) return staff;
 *
 * Signed-out visitors are sent to /login and returned here afterwards.
 */
export function requireStaffPage(Astro: AstroGlobal): Staff | Response {
  const { user, staff } = Astro.locals;
  if (!user) {
    const next = encodeURIComponent(Astro.url.pathname + Astro.url.search);
    return Astro.redirect(`/login?next=${next}`);
  }
  if (!staff) return Astro.redirect('/login?error=not_staff');
  return staff;
}
