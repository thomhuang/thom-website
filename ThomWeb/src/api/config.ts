// The API base URL is the website's only build-time variable. Production serves
// the API from the site's own origin — the Worker proxies /api to thom-server —
// so it defaults to a relative /api. Local development talks to the Go server
// directly. Set REACT_APP_API_URL to override either default.
export const API_BASE_URL =
  process.env.REACT_APP_API_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : '/api');
