import { e as defineMiddleware, s as sequence } from './chunks/render-context_DqyYl2gj.mjs';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import 'es-module-lexer';
import './chunks/astro-designed-error-pages_QXdr_Win.mjs';
import 'piccolore';
import './chunks/astro/server_DA7puEs0.mjs';
import 'clsx';

const url = "https://ddvgtuvnjabhjlumoxls.supabase.co";
const anonKey = "sb_publishable_Qrl1C6c1Q3pkaFLDc_rYnA_mybkjTPB";
function createSupabase(request, cookies) {
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get("Cookie") ?? "").map(({ name, value }) => ({
          name,
          value: value ?? ""
        }));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, options);
        }
      }
    }
  });
}

const onRequest$1 = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) return next();
  const supabase = createSupabase(context.request, context.cookies);
  context.locals.supabase = supabase;
  context.locals.user = null;
  context.locals.staff = null;
  const { data } = await supabase.auth.getUser();
  if (data.user) {
    context.locals.user = data.user;
    const { data: staff } = await supabase.from("staff").select("staff_id, full_name, email, role").eq("auth_user_id", data.user.id).maybeSingle();
    context.locals.staff = staff ?? null;
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
