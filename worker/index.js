// Static assets are served by Cloudflare (see assets in wrangler.jsonc).
// This script only runs for /api/* and forwards those requests to the
// thom-server Worker, stripping the /api prefix. Proxying through the same
// origin keeps the auth cookie first-party instead of third-party.
//
// Anonymous GETs on a short allowlist of public paths are served from the
// Worker Cache API. Paths whose response varies by viewer (shop items, which
// serve drafts to an admin) are never served from cache to a cookie-bearing
// request; paths that are public for everyone stay cached either way.

export function stripApiPrefix(pathname) {
  return pathname.replace(/^\/api(?=\/|$)/, "") || "/";
}

// Paths (after stripApiPrefix) whose response is identical for every viewer,
// with or without the auth cookie.
const alwaysPublicPaths = new Set([
  "/coffee",
  "/coffee/roasters",
  "/coffee/grinders",
  "/shop/brands",
  "/blog/categories",
]);

// /coffee/{id} for a numeric id is always public.
const alwaysPublicDetailPath = /^\/coffee\/\d+$/;

// Paths that serve drafts to an authenticated admin: cached for anonymous
// readers, but never served from cache to a request carrying a cookie.
const authVaryingPaths = new Set(["/shop/items", "/blog"]);
const authVaryingDetailPath = /^\/(shop\/items|blog)\/\d+$/;

// Every path the Worker may cache. The id pattern deliberately excludes
// /shop/items/{id}/images and /shop/orders*.
export function isCacheablePublicPath(pathname) {
  return (
    alwaysPublicPaths.has(pathname) ||
    alwaysPublicDetailPath.test(pathname) ||
    authVaryingPaths.has(pathname) ||
    authVaryingDetailPath.test(pathname)
  );
}

// A response that never varies by viewer stays cacheable even when the request
// carries the auth cookie, so a logged-in admin keeps the cache on public reads
// like the coffee list instead of paying an origin round trip on every one.
export function isAlwaysPublicPath(pathname) {
  return (
    alwaysPublicPaths.has(pathname) || alwaysPublicDetailPath.test(pathname)
  );
}

export function hasCookieHeader(request) {
  return request.headers.has("Cookie");
}

// Whether a GET may use the cache. An always-public path ignores the cookie;
// an auth-varying path is only cacheable for anonymous requests so an admin's
// draft view is never served from a shared entry.
export function isCacheableRequest(request, pathname) {
  return (
    isCacheablePublicPath(pathname) &&
    (isAlwaysPublicPath(pathname) || !hasCookieHeader(request))
  );
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
