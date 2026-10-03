import { authService } from '../services/index.js';
import { store } from '../store.js';
import { navigate, query } from '../router.js';
import { field, bindForm, rules, logo, esc } from '../components/ui.js';
import { config } from '../config.js';

const shell = (title, sub, body, foot) => `<div class="auth"><div class="auth-art"><img src="assets/images/ai-assistant.jpg" alt=""><div class="shade"></div><p>Practical skills, one lesson at a time.</p></div>
  <div class="auth-main"><div class="auth-box">${logo()}<h1>${title}</h1><p class="muted">${sub}</p>${body}<p class="alt-link">${foot}</p></div></div></div>`;
const safeNext = () => { const n = query().get('next'); return n && n.startsWith('/') && !n.startsWith('//') ? n : '/dashboard'; };
const form = (id, inner, label) => `<form id="${id}" novalidate class="form">${inner}<div data-status></div><button class="btn btn-primary block" type="submit">${label}</button></form>`;
const afterAuth = (user) => { navigate(safeNext()); store.set({ user }); }; // navigate first so the guest guard does not redirect

export const login = () => ({ title: 'Login', layout: 'bare', html: shell('Welcome back', 'Log in to continue learning.',
  form('f', field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'email' }) + field({ id: 'password', label: 'Password', type: 'password', autocomplete: 'current-password', toggle: true }) + '<a class="small" href="#/forgot-password">Forgot password?</a>', 'Log in'),
  'New here? <a href="#/signup">Create an account</a>'),
  mount: (r) => bindForm(r.querySelector('#f'), { email: rules.email, password: rules.required('Password') }, async (d) => afterAuth(await authService.login(d.email, d.password))) });

export const signup = () => ({ title: 'Sign up', layout: 'bare', html: shell('Create your account', `Join ${esc(config.brand)} and start learning.`,
  form('f', field({ id: 'name', label: 'Full name', autocomplete: 'name' }) + field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'email' }) + field({ id: 'password', label: 'Password', type: 'password', autocomplete: 'new-password', toggle: true, hint: 'At least 8 characters.' }) + field({ id: 'confirm', label: 'Confirm password', type: 'password', autocomplete: 'new-password', toggle: true }), 'Create account'),
  'Already registered? <a href="#/login">Log in</a>'),
  mount: (r) => bindForm(r.querySelector('#f'), { name: rules.required('Name'), email: rules.email, password: rules.password, confirm: rules.match('password') },
    async (d) => afterAuth(await authService.signup({ name: d.name, email: d.email, password: d.password }))) });

export const forgot = () => ({ title: 'Forgot password', layout: 'bare', html: shell('Reset your password', 'Enter your email and we will send reset instructions if an account exists.',
  form('f', field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'email' }), 'Send reset link'), '<a href="#/login">Back to login</a>'),
  mount: (r) => bindForm(r.querySelector('#f'), { email: rules.email }, async (d, ok) => { await authService.forgotPassword(d.email); ok('If an account exists for that email, a reset link is on its way.'); }) });

export const reset = () => ({ title: 'Choose a new password', layout: 'bare', html: shell('Choose a new password', 'The reset token comes from the link in your email.',
  form('f', field({ id: 'password', label: 'New password', type: 'password', autocomplete: 'new-password', toggle: true }) + field({ id: 'confirm', label: 'Confirm password', type: 'password', autocomplete: 'new-password', toggle: true }), 'Update password'), '<a href="#/login">Back to login</a>'),
  mount: (r) => bindForm(r.querySelector('#f'), { password: rules.password, confirm: rules.match('password') }, async (d, ok) => {
    const token = query().get('token'); if (!token) throw new Error('This reset link is invalid or has expired. Request a new one.');
    await authService.resetPassword(token, d.password); ok('Password updated. Redirecting to login…'); setTimeout(() => navigate('/login'), 1200); }) });
