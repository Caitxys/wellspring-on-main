import { p as permissionsFor } from '../../chunks/auth_CHY3ww-v.mjs';
import { a as requireStaff, j as json } from '../../chunks/http_CD72WQX6.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const GET = ({ locals }) => {
  const staff = requireStaff(locals);
  if (staff instanceof Response) return staff;
  return json(200, { staff, permissions: permissionsFor(staff) });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
