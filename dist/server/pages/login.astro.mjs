import { e as createComponent, l as renderComponent, r as renderTemplate, h as createAstro, m as maybeRenderHead, g as addAttribute } from '../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import { $ as $$StaffLayout } from '../chunks/StaffLayout_Dbp9_nrD.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Login;
  const rawNext = Astro2.url.searchParams.get("next") ?? "";
  const next = rawNext.startsWith("/staff") ? rawNext : "/staff";
  let error = "";
  let email = "";
  if (Astro2.url.searchParams.get("error") === "not_staff") {
    error = "This account is signed in but is not linked to a Wellspring staff member. Ask an administrator to run database/02_link_test_accounts.sql.";
  }
  if (Astro2.request.method === "POST") {
    const form = await Astro2.request.formData();
    email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      error = "Enter your email and password.";
    } else {
      const { error: signInError } = await Astro2.locals.supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        error = "That email and password do not match a staff account.";
      } else {
        return Astro2.redirect(next, 303);
      }
    }
  } else if (Astro2.locals.staff) {
    return Astro2.redirect(next);
  }
  const signedOut = Astro2.url.searchParams.has("signed_out");
  return renderTemplate`${renderComponent($$result, "StaffLayout", $$StaffLayout, { "title": "Staff sign in" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="narrow"> <div class="panel"> <h1>Staff sign in</h1> <p class="lead">Sign in to submit or review website content updates.</p> ${signedOut && !error && renderTemplate`<div class="alert alert-info" role="status">You are signed out.</div>`} ${error && renderTemplate`<div class="alert alert-error" role="alert">${error}</div>`} <form method="post"> <div class="field"> <label for="email">Email</label> <input id="email" name="email" type="email" autocomplete="username" required${addAttribute(email, "value")}> </div> <div class="field"> <label for="password">Password</label> <input id="password" name="password" type="password" autocomplete="current-password" required> </div> <button type="submit" class="btn btn-primary">Sign in</button> </form> </div> <p><a href="/">Back to the website</a></p> </div> ` })}`;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/login.astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
