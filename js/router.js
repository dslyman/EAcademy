// Hash router (works on any static host). Route: { path:'/x/:id', page, access:'public'|'guest'|'user', layout:'site'|'bare' }
export const navigate = (to) => { location.hash = '#' + to; };
export const currentPath = () => (location.hash.slice(1) || '/').split('?')[0];
export const query = () => new URLSearchParams((location.hash.split('?')[1]) || '');

export function matchRoute(routes, path) {
  for (const route of routes) {
    const keys = [];
    const re = new RegExp('^' + route.path.replace(/:([^/]+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$');
    const m = path.match(re);
    if (m) return { route, params: Object.fromEntries(keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
  }
  return null;
}
