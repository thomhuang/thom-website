// The API base URL is the website's only build-time variable. Production serves
// the API from the site's own origin — the Worker proxies /api to thom-server —
// so it defaults to a relative /api. Local development talks to the Go server
// directly. Set VITE_API_URL to override either default.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:4000' : '/api');
