import { e as createComponent, r as renderTemplate } from '../../chunks/astro/server_DA7puEs0.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const $$id = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate``;
}, "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/[id].astro", void 0);

const $$file = "C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/src/pages/staff/[id].astro";
const $$url = "/staff/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$id,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
