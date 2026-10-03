import { store } from './store.js';
import { matchRoute, currentPath, navigate } from './router.js';
import { authService } from './services/index.js';
import { header, footer, errorState, skeleton, esc } from './components/ui.js';
import * as pub from './pages/public.js';
import * as auth from './pages/auth.js';
import * as stu from './pages/student.js';
import { config } from './config.js';

const routes = [
  { path: '/', page: pub.home }, { path: '/courses', page: pub.coursesPage }, { path: '/courses/:slug', page: pub.courseDetail },
  { path: '/about', page: pub.about }, { path: '/contact', page: pub.contact }, { path: '/legal/:doc', page: pub.legal },
  { path: '/login', page: auth.login, access: 'guest' }, { path: '/signup', page: auth.signup, access: 'guest' },
  { path: '/forgot-password', page: auth.forgot, access: 'guest' }, { path: '/reset-password', page: auth.reset },
  { path: '/dashboard', page: stu.dashboard, access: 'user' }, { path: '/my-learning', page: stu.myLearning, access: 'user' },
  { path: '/learn/:slug', page: stu.player, access: 'user' }, { path: '/learn/:slug/:lessonId', page: stu.player, access: 'user' },
  { path: '/profile', page: stu.profile, access: 'user' },
];
const app = document.getElementById('app');
let token = 0;

async function render() {
  const { user, ready } = store.get(); if (!ready) return;
  const path = currentPath(), hit = matchRoute(routes, path), id = ++token;
  if (hit?.route.access === 'user' && !user) return navigate(`/login?next=${encodeURIComponent(path)}`);
  if (hit?.route.access === 'guest' && user) return navigate('/dashboard');
  const frame = (inner, bare) => { app.innerHTML = bare ? `<div id="main" tabindex="-1">${inner}</div>` : `${header(user, path)}<main id="main" tabindex="-1">${inner}</main>${footer()}`; };
  const run = async () => {
    frame(`<div class="wrap section">${skeleton()}</div>`, false);
    try {
      const page = hit ? await hit.route.page({ params: hit.params, user }) : pub.notFound();
      if (id !== token) return;
      frame(page.html, page.layout === 'bare' || hit?.route.path.startsWith('/learn'));
      document.title = `${page.title} | ${config.brand}`; page.mount?.(document.getElementById('main'));
    } catch (e) {
      if (id !== token) return;
      if (e.status === 404) frame(pub.notFound().html); else if (e.status === 401) { store.set({ user: null }); return; }
      else { frame(`<div class="wrap section">${errorState(e.message)}</div>`); document.querySelector('[data-retry]')?.addEventListener('click', run); }
    }
    window.scrollTo(0, 0);
  };
  await run();
}

document.addEventListener('click', async (e) => {
  if (e.target.closest('[data-logout]')) { await authService.logout().catch(() => {}); store.set({ user: null }); navigate('/'); }
  const mb = e.target.closest('.menu-btn');
  if (mb) { const open = document.getElementById('nav').classList.toggle('open'); mb.setAttribute('aria-expanded', open); }
  else if (e.target.closest('.nav a')) document.getElementById('nav')?.classList.remove('open');
});
window.addEventListener('hashchange', render);
let last; store.subscribe(s => { const id = s.user?.id ?? null; if (id !== last) { last = id; render(); } }); // re-render on sign-in/out only, not profile edits
(async () => { let user = null; try { user = await authService.session(); } catch { /* unauthenticated */ } store.set({ user, ready: true }); render(); })();
