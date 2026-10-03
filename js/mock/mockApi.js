// DEV-ONLY MOCK ADAPTER. Not authentication and not a backend: it exists so the UI can be exercised
// before the real API exists. State lives in memory only (resets on refresh). Delete this folder and
// set USE_MOCK=false when the backend is ready; nothing else imports it.
import { courses } from '../data/courses.js';

const wait = (ms = 350) => new Promise(r => setTimeout(r, ms));
const fail = (message, status = 400) => { const e = new Error(message); e.status = status; e.fieldErrors = {}; throw e; };
const db = { user: null, enrollments: [], progress: [], reset: new Set() };

export async function mockRequest(path, { method = 'GET', body } = {}) {
  await wait();
  const key = `${method} ${path}`;
  if (key === 'GET /auth/session') return { user: db.user };
  if (key === 'POST /auth/login' || key === 'POST /auth/signup') {
    const name = body.name || body.email.split('@')[0];
    db.user = { id: 'dev-user', name, email: body.email, phone: '', preferences: { courseUpdates: true, reminders: true, news: false } };
    return { user: db.user };
  }
  if (key === 'POST /auth/logout') { db.user = null; return null; }
  if (key === 'POST /auth/forgot-password') return { ok: true };
  if (key === 'POST /auth/reset-password') return { ok: true };
  if (key === 'GET /courses') return courses.map(({ modules, ...c }) => ({ ...c, lessonCount: modules.flatMap(m => m.lessons).length, modules }));
  if (method === 'GET' && path.startsWith('/courses/')) return courses.find(c => c.slug === decodeURIComponent(path.slice(9))) ?? fail('Course not found', 404);
  if (!db.user) fail('Please log in.', 401);
  if (key === 'GET /enrollments') return db.enrollments;
  if (key === 'POST /enrollments') { if (!db.enrollments.some(e => e.courseId === body.courseId)) db.enrollments.push({ courseId: body.courseId, enrolledAt: new Date().toISOString() }); return db.enrollments; }
  if (key === 'GET /progress') return db.progress;
  if (method === 'PUT' && path.startsWith('/progress/')) {
    const [, , courseId, , lessonId] = path.split('/');
    let p = db.progress.find(x => x.courseId === courseId);
    if (!p) db.progress.push(p = { courseId, completedLessonIds: [], lastLessonId: lessonId, lastAccessedAt: null });
    const set = new Set(p.completedLessonIds); body.completed ? set.add(lessonId) : set.delete(lessonId);
    Object.assign(p, { completedLessonIds: [...set], lastLessonId: lessonId, lastAccessedAt: new Date().toISOString() });
    return p;
  }
  if (key === 'PATCH /me') { Object.assign(db.user, body); return db.user; }
  if (key === 'PATCH /me/preferences') { db.user.preferences = body; return db.user; }
  if (key === 'POST /me/password') return { ok: true };
  return fail('Not found', 404);
}
