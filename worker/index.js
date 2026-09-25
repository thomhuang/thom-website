// Static assets are served by Cloudflare (see assets in wrangler.jsonc).
// This script only runs for /api/* and forwards those requests to the
// thom-server Worker, stripping the /api prefix. Proxying through the same
// origin keeps the auth cookie first-party instead of third-party.
//
// Anonymous GETs on a short allowlist of public paths are served from the
// Worker Cache API. Every cacheable path bypasses the cache for a
// cookie-bearing request, so an authenticated admin's edits (a new coffee
// entry, brand, or post) are visible immediately instead of after the shared
// cache's max-age.

export function stripApiPrefix(pathname) {
  return pathname.replace(/^\/api(?=\/|$)/, "") || "/";
}

// Paths (after stripApiPrefix) cached for anonymous readers but never served
// from cache to a request carrying a cookie, so the admin always sees fresh
// data after editing.
const authVaryingPaths = new Set([
  "/coffee",
  "/coffee/roasters",
  "/coffee/grinders",
  "/shop/items",
  "/shop/brands",
  "/blog",
  "/blog/categories",
]);
const authVaryingDetailPath = /^\/(coffee|shop\/items|blog)\/\d+$/;

// Every path the Worker may cache. The id pattern deliberately excludes
// /shop/items/{id}/images and /shop/orders*.
export function isCacheablePublicPath(pathname) {
  return authVaryingPaths.has(pathname) || authVaryingDetailPath.test(pathname);
}

export function hasCookieHeader(request) {
  return request.headers.has("Cookie");
}

// Whether a GET may use the cache. A cookie-bearing request (an admin session)
// always bypasses the cache so edits are visible immediately.
export function isCacheableRequest(request, pathname) {
  return isCacheablePublicPath(pathname) && !hasCookieHeader(request);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    url.pathname = stripApiPrefix(url.pathname);

    if (request.method === "GET" && isCacheableRequest(request, url.pathname)) {
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
