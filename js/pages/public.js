import { courseService, enrollmentService } from '../services/index.js';
import { courseCard, emptyState, errorState, esc, icon, notice, field, bindForm, rules, lessonsOf, skeleton } from '../components/ui.js';
import { navigate } from '../router.js';
import { config } from '../config.js';

const steps = [['Discover', 'Browse the four courses and pick the skill that fits your goals.'], ['Enrol', 'Create a free account and enrol in a course in a few clicks.'], ['Learn', 'Work through short lessons and exercises at your own pace.'], ['Complete', 'Finish every lesson to complete the course and earn your certificate.']];
const benefits = [['Practical by design', 'Every module ends with an exercise that produces something you can use.'], ['Structured pathways', 'Short lessons in a clear order, so you always know what to do next.'], ['Learn at your pace', 'Pick up where you left off on any device. Progress is saved to your account.'], ['Honest outcomes', 'We teach skills and habits. We do not promise income or job offers.']];

export async function home() {
  const courses = await courseService.list();
  return { title: 'Practical digital skills', html: `
  <section class="hero"><div class="wrap hero-grid"><div>
    <span class="chip">Practical, income-relevant skills</span>
    <h1>Learn skills that <em>work in the real world</em></h1>
    <p class="lead">${esc(config.brand)} teaches trading and analysis, AI automation, copywriting and content creation through short lessons, hands-on exercises and clear progress tracking.</p>
    <div class="row"><a class="btn btn-primary" href="#/courses">Explore Courses</a><a class="btn btn-ghost" href="#/signup">Start Learning</a></div></div>
    <div class="hero-img"><img src="assets/images/hero-main.jpg" alt="A student working on a laptop beside an AI assistant" fetchpriority="high"></div></div></section>
  <section class="section wrap"><div class="head"><h2>Four courses, one learning home</h2><a href="#/courses">View all courses ${icon('arrow', 16)}</a></div>
    <div class="grid">${courses.map(c => courseCard(c)).join('')}</div></section>
  <section class="section alt"><div class="wrap"><h2>Why learn here</h2><div class="grid g4">${benefits.map(([t, d]) => `<div class="card pad"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div></section>
  <section class="section wrap"><h2>What learning looks like</h2><p class="muted narrow">Each lesson is a focused video, reading or exercise. Lessons sit inside modules, modules build a course, and your dashboard shows exactly where to continue.</p>
    <ol class="steps">${steps.map(([t, d], i) => `<li class="card pad"><span class="num">${i + 1}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}</ol></section>
  <section class="wrap"><div class="cta-band"><h2>Pick a course and begin today</h2><p>Create your free account and enrol when you are ready.</p><a class="btn btn-primary" href="#/signup">Get Started</a></div></section>` };
}

export async function coursesPage() {
  const all = await courseService.list();
  const cats = [...new Set(all.map(c => c.category))];
  return { title: 'Courses', html: `<section class="section wrap"><h1>Courses</h1><p class="muted narrow">Choose a course and learn at your own pace.</p>
    <div class="filters"><label class="sr" for="q">Search courses</label><input id="q" type="search" placeholder="Search courses"><div class="pills" role="group" aria-label="Category">
    <button class="pill on" data-cat="">All</button>${cats.map(c => `<button class="pill" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
    <div id="list" class="grid" aria-live="polite"></div></section>`,
  mount(root) {
    let cat = ''; const q = root.querySelector('#q'), list = root.querySelector('#list');
    const draw = () => { const t = q.value.toLowerCase(); const r = all.filter(c => (!cat || c.category === cat) && (c.title + c.summary).toLowerCase().includes(t));
      list.innerHTML = r.length ? r.map(c => courseCard(c)).join('') : emptyState({ title: 'No courses found', text: 'Try a different search or category.' }); };
    q.addEventListener('input', draw);
    root.querySelectorAll('.pill').forEach(b => b.addEventListener('click', () => { cat = b.dataset.cat; root.querySelectorAll('.pill').forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    draw();
  } };
}

export async function courseDetail({ params, user }) {
  const [c, all, enrolled] = await Promise.all([courseService.get(params.slug), courseService.list(), user ? enrollmentService.list() : []]);
  const isEnrolled = enrolled.some(e => e.courseId === c.id), total = lessonsOf(c).length;
  const cta = isEnrolled ? `<a class="btn btn-primary" href="#/learn/${c.slug}">Continue learning</a>` : `<button class="btn btn-primary" data-enrol>Enrol in this course</button>`;
  const list = (a) => `<ul class="ticks">${a.map(x => `<li>${icon('check', 16)}${esc(x)}</li>`).join('')}</ul>`;
  return { title: c.title, html: `
  <section class="hero small"><div class="wrap hero-grid"><div><span class="chip">${esc(c.category)}</span><h1>${esc(c.title)}</h1><p class="lead">${esc(c.summary)}</p>
    <div class="meta big"><span>${esc(c.level)}</span><span>${esc(c.duration)}</span><span>${c.modules.length} modules</span><span>${total} lessons</span></div>
    <div class="row">${cta}</div><div id="enrol-status"></div></div>
    <div class="hero-img"><img src="${c.image}" alt="" style="object-position:${c.imagePos}"></div></div></section>
  <section class="section wrap two"><div><h2>What you will learn</h2>${list(c.outcomes)}
    <h2 class="mt">Curriculum</h2>${c.modules.map((m, i) => `<details class="card acc" ${i === 0 ? 'open' : ''}><summary>Module ${i + 1}: ${esc(m.title)} <small>${m.lessons.length} lessons</small></summary>
      <ul class="lessons">${m.lessons.map(l => `<li><span class="type">${esc(l.type)}</span>${esc(l.title)}<small>${l.minutes} min</small></li>`).join('')}</ul></details>`).join('')}</div>
    <aside><div class="card pad"><h3>Who it is for</h3>${list(c.audience)}</div><div class="card pad mt"><h3>Skills you will practise</h3><div class="pills">${c.skills.map(s => `<span class="chip">${esc(s)}</span>`).join('')}</div></div></aside></section>
  <section class="section alt"><div class="wrap"><h2>Related courses</h2><div class="grid">${all.filter(x => x.id !== c.id).slice(0, 3).map(x => courseCard(x)).join('')}</div></div></section>`,
  mount(root) {
    root.querySelector('[data-enrol]')?.addEventListener('click', async (e) => {
      if (!user) return navigate(`/signup?next=/courses/${c.slug}`);
      e.target.disabled = true; e.target.textContent = 'Enrolling…';
      try { await enrollmentService.enroll(c.id); navigate(`/learn/${c.slug}`); }
      catch (err) { e.target.disabled = false; e.target.textContent = 'Enrol in this course'; root.querySelector('#enrol-status').innerHTML = notice('error', err.message); }
    });
  } };
}

export const about = () => ({ title: 'About', html: `<section class="section wrap narrow-page"><h1>About ${esc(config.brand)}</h1>
  <p class="lead">${esc(config.brand)} is a digital academy for people who want practical skills they can apply straight away.</p>
  <h2>Why we exist</h2><p>Plenty of people want to learn modern digital skills but struggle to find clear, structured teaching. We exist to close that gap with courses that are organised, realistic and focused on doing.</p>
  <h2>Our approach</h2><p>Lessons are short and sequenced. Every module includes an exercise, so you build real work as you learn, and your dashboard always shows what to do next.</p>
  <h2>The skills we focus on</h2><p>Financial market trading and analysis, AI automation, copywriting and content creation. We chose skills with practical, everyday use in the digital economy.</p>
  <h2>What we do not promise</h2><p>We do not guarantee income, employment or trading results. Markets carry risk, and results depend on your effort and circumstances. We promise clear teaching and honest guidance.</p>
  <a class="btn btn-primary" href="#/courses">Explore courses</a></section>` });

export const contact = () => ({ title: 'Contact & support', html: `<section class="section wrap two"><div><h1>Contact &amp; support</h1>
  <p class="muted">Send us a message and the team will reply by email. Response times vary with demand.</p>
  <form id="contact" novalidate class="form">${field({ id: 'name', label: 'Your name', autocomplete: 'name' })}${field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'email' })}
    <div class="field"><label for="topic">Topic</label><div class="control"><select id="topic" name="topic"><option>Course question</option><option>Account or login</option><option>Technical problem</option><option>Other</option></select></div><small class="err" id="topic-err"></small></div>
    ${field({ id: 'message', label: 'Message', textarea: true })}<div data-status></div><button class="btn btn-primary" type="submit">Send message</button></form></div>
  <aside><h2>Common questions</h2>${[['Do I need experience?', 'No. Courses are marked with a level, and most start from the basics.'], ['Can I learn on my phone?', 'Yes. The learning area is designed to work on mobile devices.'], ['How do certificates work?', 'Complete every lesson in a course and your certificate becomes available in your dashboard.'], ['Is trading risk-free?', 'No. Trading involves risk of loss. The course teaches analysis and risk management, not guaranteed results.']].map(([q, a]) => `<details class="card acc"><summary>${q}</summary><p class="pad">${a}</p></details>`).join('')}</aside></section>`,
  mount(root) {
    // BACKEND INTEGRATION POINT: replace with a supportService.send(data) -> POST /support/messages
    bindForm(root.querySelector('#contact'), { name: rules.required('Name'), email: rules.email, message: rules.required('Message') },
      async (_d, ok) => { throw Object.assign(new Error('Support messaging is not connected yet. Email us directly at ' + config.supportEmail + '.'), { fieldErrors: {} }); });
  } });

export const legal = ({ params }) => ({ title: 'Legal', html: `<section class="section wrap narrow-page"><h1>${params.doc === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}</h1><p class="muted">Placeholder: the final legal text must be supplied and reviewed before launch.</p></section>` });

export const notFound = () => ({ title: 'Page not found', html: `<section class="section wrap">${emptyState({ title: 'Page not found', text: 'The page you are looking for does not exist or has moved.', href: '#/', cta: 'Back to home' })}</section>` });
export { errorState, skeleton };
