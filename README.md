# Ever Academy frontend

Vanilla HTML/CSS/ES modules, no build step and no dependencies. Serve the folder statically, e.g. `python3 -m http.server 8080`, and open http://localhost:8080 (ES modules need http, not file://).

## Architecture
- `js/config.js` public config (brand, API base URL, `USE_MOCK`). Override with `window.__EVER_ENV__`. No secrets.
- `js/data/courses.js` structured course catalogue (add a course by appending one object).
- `js/services/index.js` **the backend contract**: authService, courseService, enrollmentService, progressService, userService, with each endpoint documented.
- `js/services/http.js` single swap point: real `fetch` (cookie sessions, `credentials: 'include'`) or the mock.
- `js/mock/mockApi.js` dev-only in-memory adapter. It is NOT authentication. Delete it and set `USE_MOCK=false` for the real API.
- `js/store.js` central auth state; `js/router.js` hash router with `user`/`guest` access guards in `js/main.js`.
- `js/components/ui.js` shared components and the form validation helper; `js/pages/*` one function per page.

## Backend integration
Set `window.__EVER_ENV__ = { API_BASE_URL: 'https://…', USE_MOCK: false }`. Expected shapes are in the comments of `services/index.js` and `data/courses.js`. Errors: `{ message, fieldErrors? }` with proper HTTP status (401 sends the user to login).
Open items: support messages endpoint (`pages/public.js`, contact form), real legal text, support email in `config.js`, lesson `videoUrl`s.
