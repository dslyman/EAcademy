import { courseService, enrollmentService, progressService, userService, authService } from '../services/index.js';
import { courseCard, emptyState, esc, icon, typeIcon, lessonsOf, pct, progressBar, field, bindForm, rules, notice } from '../components/ui.js';
import { navigate } from '../router.js';
import { store } from '../store.js';

async function load() {
  const [courses, enrolments, progress] = await Promise.all([courseService.list(), enrollmentService.list(), progressService.list()]);
  return enrolments.map(e => {
    const course = courses.find(c => c.id === e.courseId), p = progress.find(x => x.courseId === e.courseId) || { completedLessonIds: [] };
    const total = lessonsOf(course).length;
    return { course, p, total, percent: pct(p.completedLessonIds.length, total) };
  });
}
const resume = ({ course, p }) => { const ls = lessonsOf(course); return ls.find(l => !p.completedLessonIds.includes(l.id)) ?? ls[0]; };

export async function dashboard({ user }) {
  const items = await load();
  if (!items.length) return { title: 'Dashboard', html: `<section class="section wrap"><h1>Welcome, ${esc(user.name)}</h1>${emptyState({ title: 'You have not enrolled yet', text: 'Pick a course to start learning. Your progress will appear here.', href: '#/courses', cta: 'Browse courses' })}</section>` };
  const active = items.filter(i => i.percent < 100), done = items.filter(i => i.percent === 100);
  const cont = [...active].sort((a, b) => (b.p.lastAccessedAt || '').localeCompare(a.p.lastAccessedAt || ''))[0];
  const recent = items.filter(i => i.p.lastLessonId && i.p.lastAccessedAt).sort((a, b) => b.p.lastAccessedAt.localeCompare(a.p.lastAccessedAt)).slice(0, 3);
  return { title: 'Dashboard', html: `<section class="section wrap"><h1>Welcome back, ${esc(user.name.split(' ')[0])}</h1>
    ${cont ? `<div class="card pad continue"><div><span class="chip">Continue learning</span><h2>${esc(cont.course.title)}</h2><p class="muted">Next: ${esc(resume(cont).title)}</p>${progressBar(cont.percent)}<small>${cont.percent}% complete</small></div><a class="btn btn-primary" href="#/learn/${cont.course.slug}/${resume(cont).id}">Resume ${icon('arrow', 16)}</a></div>` : ''}
    <div class="head"><h2>My courses</h2><a href="#/my-learning">All my learning</a></div>
    <div class="grid">${items.map(i => courseCard(i.course, { progress: i.percent })).join('')}</div>
    <div class="two mt"><div><h2>Recently accessed</h2>${recent.length ? `<ul class="card list">${recent.map(r => { const l = lessonsOf(r.course).find(x => x.id === r.p.lastLessonId); return `<li><a href="#/learn/${r.course.slug}/${l.id}">${typeIcon(l.type)} ${esc(l.title)}<small>${esc(r.course.title)}</small></a></li>`; }).join('')}</ul>` : '<p class="muted">Lessons you open will appear here.</p>'}</div>
    <div><h2>Certificates</h2>${done.length ? `<ul class="card list">${done.map(d => `<li><span>${icon('check')} ${esc(d.course.title)}<small>Completed. Certificate issued under your registered name.</small></span></li>`).join('')}</ul>` : '<p class="muted">Complete every lesson in a course to unlock its certificate.</p>'}</div></div>
    <div class="actions mt"><a class="btn btn-ghost" href="#/courses">Browse courses</a><a class="btn btn-ghost" href="#/profile">Edit profile</a><a class="btn btn-ghost" href="#/contact">Get support</a></div></section>` };
}

export async function myLearning() {
  const items = await load();
  return { title: 'My Learning', html: `<section class="section wrap"><h1>My Learning</h1>${items.length ? `<div class="grid">${items.map(i => courseCard(i.course, { progress: i.percent })).join('')}</div>` : emptyState({ title: 'No enrolled courses', text: 'Enrol in a course to see it here.', href: '#/courses', cta: 'Browse courses' })}</section>` };
}

export async function player({ params }) {
  const [course, enrolments, progress] = await Promise.all([courseService.get(params.slug), enrollmentService.list(), progressService.list()]);
  if (!enrolments.some(e => e.courseId === course.id)) { navigate(`/courses/${course.slug}`); return { title: course.title, html: '' }; }
  const lessons = lessonsOf(course); let done = new Set((progress.find(p => p.courseId === course.id) || {}).completedLessonIds || []);
  let idx = Math.max(0, lessons.findIndex(l => l.id === params.lessonId)); if (!params.lessonId) idx = Math.max(0, lessons.findIndex(l => !done.has(l.id)));
  const l = lessons[idx], percent = pct(done.size, lessons.length), prev = lessons[idx - 1], next = lessons[idx + 1], isDone = done.has(l.id);
  return { title: l.title, layout: 'bare', html: `<div class="player"><header class="p-top"><a href="#/dashboard" class="back">&larr; Dashboard</a><strong>${esc(course.title)}</strong><div class="p-prog">${progressBar(percent)}<small>${percent}%</small></div><button class="btn btn-ghost btn-sm side-btn" aria-expanded="false" aria-controls="side">Lessons</button></header>
    <div class="p-body"><aside class="side" id="side" aria-label="Course curriculum">${course.modules.map(m => `<h3>${esc(m.title)}</h3><ul>${m.lessons.map(x => `<li><a href="#/learn/${course.slug}/${x.id}" ${x.id === l.id ? 'aria-current="true"' : ''}><span class="dot ${done.has(x.id) ? 'on' : ''}">${done.has(x.id) ? icon('check', 12) : ''}</span>${esc(x.title)}<small>${x.minutes}m</small></a></li>`).join('')}</ul>`).join('')}</aside>
    <main class="p-main" id="main" tabindex="-1"><div class="video">${l.videoUrl ? `<iframe src="${esc(l.videoUrl)}" title="${esc(l.title)}" allowfullscreen></iframe>` : `<div class="ph">${typeIcon(l.type)}<p>${l.type === 'video' ? 'Video will appear here once the lesson media is connected.' : 'Lesson content'}</p></div>`}</div>
      <p class="muted">Lesson ${idx + 1} of ${lessons.length}</p><h1>${esc(l.title)}</h1><p>${esc(l.content)}</p>
      ${percent === 100 ? `<div class="notice success">You have completed this course. Your certificate is available on your dashboard.</div>` : ''}<div id="p-status"></div>
      <div class="p-nav"><a class="btn btn-ghost ${prev ? '' : 'disabled'}" ${prev ? `href="#/learn/${course.slug}/${prev.id}"` : 'aria-disabled="true"'}>&larr; Previous</a>
        <button class="btn ${isDone ? 'btn-ghost' : 'btn-primary'}" data-complete aria-pressed="${isDone}">${isDone ? 'Completed. Undo' : 'Mark as complete'}</button>
        <a class="btn btn-ghost ${next ? '' : 'disabled'}" ${next ? `href="#/learn/${course.slug}/${next.id}"` : 'aria-disabled="true"'}>Next &rarr;</a></div></main></div></div>`,
  mount(root) {
    const side = root.querySelector('.side'), sb = root.querySelector('.side-btn');
    sb.addEventListener('click', () => { const o = side.classList.toggle('open'); sb.setAttribute('aria-expanded', o); });
    root.querySelector('[data-complete]').addEventListener('click', async (e) => {
      e.target.disabled = true;
      try { await progressService.setLessonComplete(course.id, l.id, !isDone); navigate(!isDone && next ? `/learn/${course.slug}/${next.id}` : `/learn/${course.slug}/${l.id}`); if (location.hash.endsWith(l.id)) dispatchEvent(new HashChangeEvent('hashchange')); }
      catch (err) { e.target.disabled = false; root.querySelector('#p-status').innerHTML = notice('error', err.message); }
    });
  } };
}

export async function profile({ user }) {
  const pr = user.preferences || {};
  const chk = (k, t) => `<label class="check"><input type="checkbox" name="${k}" ${pr[k] ? 'checked' : ''}> ${t}</label>`;
  return { title: 'Profile & settings', html: `<section class="section wrap narrow-page"><h1>Profile &amp; settings</h1>
    <form id="pf" class="card pad form" novalidate><h2>Profile</h2>${field({ id: 'name', label: 'Full name', value: user.name, autocomplete: 'name' })}
      <div class="field"><label for="em">Email</label><div class="control"><input id="em" value="${esc(user.email)}" disabled></div><small class="hint">Contact support to change your email.</small></div>
      <p class="hint">Certificates are issued under the name saved here, so use your legal name.</p><div data-status></div><button class="btn btn-primary" type="submit">Save profile</button></form>
    <form id="nf" class="card pad form mt"><h2>Notifications</h2>${chk('courseUpdates', 'Course updates')}${chk('reminders', 'Learning reminders')}${chk('news', 'Academy news')}<div data-status></div><button class="btn btn-primary" type="submit">Save preferences</button></form>
    <form id="sf" class="card pad form mt" novalidate><h2>Password &amp; security</h2>${field({ id: 'current', label: 'Current password', type: 'password', autocomplete: 'current-password', toggle: true })}${field({ id: 'next', label: 'New password', type: 'password', autocomplete: 'new-password', toggle: true })}<div data-status></div><button class="btn btn-primary" type="submit">Change password</button></form>
    <div class="card pad mt"><h2>Account</h2><p class="muted">More account options, such as billing and data export, will appear here.</p><button class="btn btn-ghost" data-logout>Log out</button></div></section>`,
  mount(root) {
    bindForm(root.querySelector('#pf'), { name: rules.required('Name') }, async (d, ok) => { store.set({ user: { ...store.get().user, ...(await userService.update({ name: d.name })) } }); ok('Profile saved.'); });
    root.querySelector('#nf').addEventListener('submit', async (e) => { e.preventDefault(); const f = e.target, v = Object.fromEntries(['courseUpdates', 'reminders', 'news'].map(k => [k, f.elements[k].checked]));
      try { await userService.setPreferences(v); f.querySelector('[data-status]').innerHTML = notice('success', 'Preferences saved.'); } catch (x) { f.querySelector('[data-status]').innerHTML = notice('error', x.message); } });
    bindForm(root.querySelector('#sf'), { current: rules.required('Current password'), next: rules.password }, async (d, ok) => { await userService.changePassword(d.current, d.next); ok('Password changed.'); });
  } };
}
export { authService };
