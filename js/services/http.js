import { config } from '../config.js';
import { mockRequest } from '../mock/mockApi.js';

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = {}) { super(message); this.status = status; this.fieldErrors = fieldErrors; }
}

// BACKEND INTEGRATION POINT: every service call goes through here.
// Real mode sends JSON to `${apiBaseUrl}${path}` using cookie sessions (credentials: 'include'),
// so no tokens are stored in JS. Expected error body: { message, fieldErrors? }.
async function realRequest(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(config.apiBaseUrl + path, {
      method, credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch { throw new ApiError('Network error. Check your connection and try again.'); }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || 'Something went wrong.', res.status, data?.fieldErrors);
  return data;
}

export const api = (path, opts) => (config.useMock ? mockRequest(path, opts) : realRequest(path, opts));
