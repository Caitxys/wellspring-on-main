export { renderers } from '../../../renderers.mjs';

const prerender = false;
const POST = async ({ locals, redirect }) => {
  await locals.supabase.auth.signOut();
  return redirect("/login?signed_out=1", 303);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
