import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_65Psm1HM.mjs';
import { manifest } from './manifest_DpacQ7EE.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/logout.astro.mjs');
const _page2 = () => import('./pages/api/content/_id_.astro.mjs');
const _page3 = () => import('./pages/api/me.astro.mjs');
const _page4 = () => import('./pages/api/requests/_id_.astro.mjs');
const _page5 = () => import('./pages/api/requests.astro.mjs');
const _page6 = () => import('./pages/login.astro.mjs');
const _page7 = () => import('./pages/staff/content.astro.mjs');
const _page8 = () => import('./pages/staff/requests/new.astro.mjs');
const _page9 = () => import('./pages/staff/requests/_id_.astro.mjs');
const _page10 = () => import('./pages/staff/requests.astro.mjs');
const _page11 = () => import('./pages/staff/_id_.astro.mjs');
const _page12 = () => import('./pages/staff.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/node.js", _page0],
    ["src/pages/api/auth/logout.ts", _page1],
    ["src/pages/api/content/[id].ts", _page2],
    ["src/pages/api/me.ts", _page3],
    ["src/pages/api/requests/[id].ts", _page4],
    ["src/pages/api/requests/index.ts", _page5],
    ["src/pages/login.astro", _page6],
    ["src/pages/staff/content/index.astro", _page7],
    ["src/pages/staff/requests/new.astro", _page8],
    ["src/pages/staff/requests/[id].astro", _page9],
    ["src/pages/staff/requests/index.astro", _page10],
    ["src/pages/staff/[id].astro", _page11],
    ["src/pages/staff/index.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = {
    "mode": "standalone",
    "client": "file:///C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/dist/client/",
    "server": "file:///C:/Users/DylanMK/OneDrive/Desktop/wellspring-on-main-main/dist/server/",
    "host": false,
    "port": 4321,
    "assets": "_astro",
    "experimentalStaticHeaders": false
};
const _exports = createExports(_manifest, _args);
const handler = _exports['handler'];
const startServer = _exports['startServer'];
const options = _exports['options'];
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { handler, options, pageMap, startServer };
