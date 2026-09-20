import assert from "node:assert/strict";
import test from "node:test";

import {
  hasCookieHeader,
  isAlwaysPublicPath,
  isCacheablePublicPath,
  isCacheableRequest,
  stripApiPrefix,
} from "./index.js";

test("strips the /api prefix", () => {
  assert.equal(stripApiPrefix("/api/coffee"), "/coffee");
  assert.equal(stripApiPrefix("/api/coffee/12"), "/coffee/12");
  assert.equal(stripApiPrefix("/api/auth/login"), "/auth/login");
});

test("maps a bare /api to the root", () => {
  assert.equal(stripApiPrefix("/api"), "/");
});

test("leaves other paths unchanged", () => {
  assert.equal(stripApiPrefix("/coffee"), "/coffee");
  assert.equal(stripApiPrefix("/"), "/");
  assert.equal(stripApiPrefix("/apiary"), "/apiary");
});

test("accepts the public cacheable paths", () => {
  for (const pathname of [
    "/coffee",
    "/coffee/roasters",
    "/coffee/grinders",
    "/coffee/12",
    "/shop/items",
    "/shop/items/7",
    "/shop/brands",
  ]) {
    assert.equal(isCacheablePublicPath(pathname), true, pathname);
  }
});

test("rejects non-public, nested, and non-numeric paths", () => {
  for (const pathname of [
    "/shop/items/1/images",
    "/shop/orders",
    "/shop/orders/view/abc",
    "/auth/me",
    "/apiary",
    "/coffee/12/extra",
    "/shop/items/abc",
  ]) {
    assert.equal(isCacheablePublicPath(pathname), false, pathname);
  }
});

test("detects a cookie header", () => {
  const anonymous = new Request("https://example.com/api/coffee");
  assert.equal(hasCookieHeader(anonymous), false);

  const withCookie = new Request("https://example.com/api/coffee", {
    headers: { Cookie: "auth=token" },
  });
  assert.equal(hasCookieHeader(withCookie), true);
});

test("identifies always-public paths", () => {
  for (const pathname of [
    "/coffee",
    "/coffee/roasters",
    "/coffee/grinders",
    "/coffee/12",
    "/shop/brands",
  ]) {
    assert.equal(isAlwaysPublicPath(pathname), true, pathname);
  }

  for (const pathname of ["/shop/items", "/shop/items/7", "/shop/orders", "/auth/me"]) {
    assert.equal(isAlwaysPublicPath(pathname), false, pathname);
  }
});

test("an auth cookie does not disable the cache for always-public paths", () => {
  const withCookie = new Request("https://example.com/api/coffee", {
    headers: { Cookie: "auth=token" },
  });

  assert.equal(isCacheableRequest(withCookie, "/coffee"), true);
  assert.equal(isCacheableRequest(withCookie, "/coffee/12"), true);
  assert.equal(isCacheableRequest(withCookie, "/shop/brands"), true);
});

test("an auth cookie disables the cache for auth-varying shop item paths", () => {
  const anonymous = new Request("https://example.com/api/shop/items");
  const withCookie = new Request("https://example.com/api/shop/items", {
    headers: { Cookie: "auth=token" },
  });

  assert.equal(isCacheableRequest(anonymous, "/shop/items"), true);
  assert.equal(isCacheableRequest(withCookie, "/shop/items"), false);
  assert.equal(isCacheableRequest(anonymous, "/shop/items/7"), true);
  assert.equal(isCacheableRequest(withCookie, "/shop/items/7"), false);
});
