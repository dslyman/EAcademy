// Tiny observable store. Auth state is managed here and nowhere else.
const state = { user: null, ready: false };
const subs = new Set();
export const store = {
  get: () => state,
  set(patch) { Object.assign(state, patch); subs.forEach(fn => fn(state)); },
  subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
};
