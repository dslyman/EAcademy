import { config } from '../config.js';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const pct = (done, total) => (total ? Math.round((done / total) * 100) : 0);
export const lessonsOf = (course) => course.modules.flatMap(m => m.lessons);

const paths = { menu: 'M4 6h16M4 12h16M4 18h16', close: 'M6 6l12 12M18 6L6 18', check: 'M5 12l5 5 9-10', arrow: 'M5 12h14M13 6l6 6-6 6', play: 'M8 5v14l11-7z', book: 'M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3zM5 17a3 3 0 013-3h11', task: 'M9 11l3 3 8-8M5 5h8M5 12h2M5 19h14' };
export const icon = (n, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]}"/></svg>`;
export const typeIcon = (t) => icon(t === 'video' ? 'play' : t === 'reading' ? 'book' : 'task', 16);

export const logo = () => `<a class="logo" href="#/"><img src="assets/images/evermore-mark-logo.png" alt="" width="36" height="23"><span>${esc(config.brand)}</span></a>`;
export const progressBar = (value, label = 'Progress') => `<div class="bar" role="progressbar" aria-label="${label}" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"><span style="width:${value}%"></span></div>`;

export function courseCard(c, { progress } = {}) {
  return `<article class="card course-card">
    <a class="thumb" href="#/courses/${c.slug}" tabindex="-1" aria-hidden="true"><img src="${c.image}" alt="" loading="lazy" style="object-position:${c.imagePos || 'center'}"></a>
    <div class="card-body"><div class="meta"><span class="chip">${esc(c.category)}</span><span>${esc(c.duration)}</span><span>${esc(c.level)}</span></div>
      <h3><a href="#/courses/${c.slug}">${esc(c.title)}</a></h3><p>${esc(c.summary)}</p>
      ${progress != null ? progressBar(progress) : ''}
      <a class="btn btn-ghost btn-sm" href="#/courses/${c.slug}">${progress != null ? 'View course' : 'View details'} ${icon('arrow', 16)}</a></div></article>`;
}

export const field = ({ id, label, type = 'text', value = '', autocomplete = '', hint = '', toggle = false, textarea = false }) => `
  <div class="field"><label for="${id}">${label}</label>
    <div class="control">${textarea ? `<textarea id="${id}" name="${id}" rows="5">${esc(value)}</textarea>`
      : `<input id="${id}" name="${id}" type="${type}" value="${esc(value)}" autocomplete="${autocomplete}">`}
      ${toggle ? `<button type="button" class="reveal" data-reveal="${id}" aria-label="Show password" aria-pressed="false">Show</button>` : ''}</div>
    ${hint ? `<small class="hint">${hint}</small>` : ''}<small class="err" id="${id}-err" role="alert"></small></div>`;

export const notice = (kind, text) => `<div class="notice ${kind}" role="${kind === 'error' ? 'alert' : 'status'}">${esc(text)}</div>`;
export const emptyState = ({ title, text, href, cta }) => `<div class="state"><h2>${title}</h2><p>${text}</p>${href ? `<a class="btn btn-primary" href="${href}">${cta}</a>` : ''}</div>`;
export const errorState = (message = 'We could not load this page.') => `<div class="state"><h2>Something went wrong</h2><p>${esc(message)}</p><button class="btn btn-primary" data-retry>Try again</button></div>`;
export const skeleton = (n = 3) => `<div class="grid" aria-busy="true" aria-label="Loading">${'<div class="card skel"></div>'.repeat(n)}</div>`;

export function header(user, path) {
  const links = user
    ? [['/dashboard', 'Dashboard'], ['/my-learning', 'My Learning'], ['/courses', 'Courses'], ['/profile', 'Profile']]
    : [['/', 'Home'], ['/courses', 'Courses'], ['/about', 'About'], ['/contact', 'Contact']];
  const nav = links.map(([p, t]) => `<a href="#${p}" ${path === p ? 'aria-current="page"' : ''}>${t}</a>`).join('');
  const cta = user ? `<button class="btn btn-ghost btn-sm" data-logout>Log out</button>`
    : `<a class="btn btn-ghost btn-sm" href="#/login">Login</a><a class="btn btn-primary btn-sm" href="#/signup">Get Started</a>`;
  return `<header class="site-header"><div class="wrap bar-row">${logo()}
    <nav class="nav" id="nav" aria-label="Main">${nav}<div class="nav-cta">${cta}</div></nav>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${icon('menu', 22)}</button></div></header>`;
}

export const footer = () => `<footer class="site-footer"><div class="wrap foot-grid">
  <div>${logo()}<p class="muted">Practical digital skills, taught step by step.</p></div>
  <div><h4>Academy</h4><a href="#/courses">Courses</a><a href="#/about">About</a><a href="#/contact">Contact &amp; support</a></div>
  <div><h4>Account</h4><a href="#/login">Login</a><a href="#/signup">Sign up</a><a href="#/dashboard">Dashboard</a></div>
  <div><h4>Legal &amp; contact</h4><a href="#/legal/terms">Terms of Use</a><a href="#/legal/privacy">Privacy Policy</a><a href="mailto:${config.supportEmail}">${esc(config.supportEmail)}</a></div></div>
  <div class="wrap copy">&copy; ${new Date().getFullYear()} ${esc(config.brand)}. All rights reserved.</div></footer>`;

// Form helper: validates, toggles loading, maps ApiError.fieldErrors, shows status. rules: { fieldName: (value, all) => errorString|'' }
export function bindForm(form, rules, onSubmit) {
  const status = form.querySelector('[data-status]');
  const setErr = (name, msg) => { const el = form.querySelector(`#${name}-err`), inp = form.elements[name]; if (el) el.textContent = msg || ''; inp?.setAttribute('aria-invalid', msg ? 'true' : 'false'); };
  form.querySelectorAll('[data-reveal]').forEach(b => b.addEventListener('click', () => {
    const i = form.elements[b.dataset.reveal], show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.textContent = show ? 'Hide' : 'Show'; b.setAttribute('aria-pressed', show); b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    let bad = null;
    for (const [name, rule] of Object.entries(rules)) { const m = rule(data[name]?.trim?.() ?? data[name], data); setErr(name, m); if (m && !bad) bad = name; }
    if (bad) { form.elements[bad].focus(); return; }
    const btn = form.querySelector('[type=submit]'); btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Please wait…'; status.innerHTML = '';
    try { await onSubmit(data, (msg) => { status.innerHTML = notice('success', msg); }); }
    catch (err) { Object.entries(err.fieldErrors || {}).forEach(([k, v]) => setErr(k, v)); status.innerHTML = notice('error', err.message || 'Something went wrong.'); }
    finally { btn.disabled = false; btn.textContent = btn.dataset.label; }
  });
}
export const rules = {
  required: (label) => (v) => (v ? '' : `${label} is required.`),
  email: (v) => (!v ? 'Email is required.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address.'),
  password: (v) => (!v ? 'Password is required.' : v.length < 8 ? 'Use at least 8 characters.' : ''),
  match: (other) => (v, all) => (v === all[other] ? '' : 'Passwords do not match.'),
};
