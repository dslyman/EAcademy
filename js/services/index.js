// Service interfaces. Pages and components import ONLY from here, never from fetch or mock code.
// Each function documents the endpoint the backend must provide.
import { api } from './http.js';

export const authService = {
  session: () => api('/auth/session').then(r => r.user),                 // GET  /auth/session -> { user }
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }).then(r => r.user),
  signup: (data) => api('/auth/signup', { method: 'POST', body: data }).then(r => r.user),
  logout: () => api('/auth/logout', { method: 'POST' }),
  forgotPassword: (email) => api('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => api('/auth/reset-password', { method: 'POST', body: { token, password } }),
};
export const courseService = {
  list: () => api('/courses'),                                           // GET /courses -> Course[]
  get: (slug) => api(`/courses/${encodeURIComponent(slug)}`),            // GET /courses/:slug -> Course (with modules)
};
export const enrollmentService = {
  list: () => api('/enrollments'),                                       // GET  -> [{ courseId, enrolledAt }]
  enroll: (courseId) => api('/enrollments', { method: 'POST', body: { courseId } }),
};
export const progressService = {
  list: () => api('/progress'),                                          // GET -> [{ courseId, completedLessonIds[], lastLessonId, lastAccessedAt }]
  setLessonComplete: (courseId, lessonId, completed) =>
    api(`/progress/${courseId}/lessons/${lessonId}`, { method: 'PUT', body: { completed } }),
};
export const userService = {
  update: (patch) => api('/me', { method: 'PATCH', body: patch }),       // name, phone
  setPreferences: (prefs) => api('/me/preferences', { method: 'PATCH', body: prefs }),
  changePassword: (current, next) => api('/me/password', { method: 'POST', body: { current, next } }),
};
