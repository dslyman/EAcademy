// Central configuration. Replace values per environment (or inject at deploy time).
// No secrets belong here: the frontend only needs a public API base URL.
export const config = {
  brand: 'Ever Academy',
  supportEmail: 'support@example.com', // TODO: set real support address
  apiBaseUrl: window.__EVER_ENV__?.API_BASE_URL ?? '/api',
  // Firebase mode active
  useMock: window.__EVER_ENV__?.USE_MOCK ?? false,
};
