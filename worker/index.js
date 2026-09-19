// Static assets are served by Cloudflare (see assets in wrangler.jsonc).
// This script only runs for /api/* and forwards those requests to the
// thom-server Worker, stripping the /api prefix. Proxying through the same
// origin keeps the auth cookie first-party instead of third-party.
//
// Anonymous GETs on a short allowlist of public paths are served from the
// Worker Cache API. Cookie-bearing requests always bypass the cache and are
// never stored, because an authenticated admin sees draft listings.

export function stripApiPrefix(pathname) {
  return pathname.replace(/^\/api(?=\/|$)/, "") || "/";
}

// Paths (after stripApiPrefix) whose response is identical for every viewer.
const publicCachePaths = new Set([
  "/coffee",
  "/coffee/roasters",
  "/coffee/grinders",
  "/shop/items",
  "/shop/brands",
]);

// /coffee/{id} and /shop/items/{id} for a numeric id only. This deliberately
// excludes /shop/items/{id}/images and /shop/orders*.
const publicCacheDetailPath = /^\/(?:coffee|shop\/items)\/\d+$/;

export function isCacheablePublicPath(pathname) {
  return publicCachePaths.has(pathname) || publicCacheDetailPath.test(pathname);
}

export function hasCookieHeader(request) {
  return request.headers.has("Cookie");
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    url.pathname = stripApiPrefix(url.pathname);

    if (
      request.method === "GET" &&
      isCacheablePublicPath(url.pathname) &&
      !hasCookieHeader(request)
    ) {
      const cache = caches.default;
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      const response = await env.API.fetch(new Request(url, request));
      const cacheControl = response.headers.get("Cache-Control");
      if (response.status === 200 && cacheControl && cacheControl.includes("public")) {
        const put = cache.put(request, response.clone());
        if (ctx && typeof ctx.waitUntil === "function") {
          ctx.waitUntil(put);
        } else {
          await put;
        }
      }

      return response;
    }

    return env.API.fetch(new Request(url, request));
  },
};
