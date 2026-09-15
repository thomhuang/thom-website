// Static assets are served by Cloudflare (see assets in wrangler.jsonc).
// This script only runs for /api/* and forwards those requests to the
// thom-server Worker, stripping the /api prefix. Proxying through the same
// origin keeps the auth cookie first-party instead of third-party.

export function stripApiPrefix(pathname) {
  return pathname.replace(/^\/api(?=\/|$)/, "") || "/";
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    url.pathname = stripApiPrefix(url.pathname);

    return env.API.fetch(new Request(url, request));
  },
};
