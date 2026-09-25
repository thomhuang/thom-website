import assert from "node:assert/strict";
import test from "node:test";

import {
  hasCookieHeader,
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
    "/blog",
    "/blog/categories",
    "/blog/2",
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
    "/blog/2/extra",
    "/blog/abc",
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

test("an auth cookie disables the cache for every cacheable path", () => {
  for (const pathname of [
    "/coffee",
    "/coffee/roasters",
    "/coffee/grinders",
    "/coffee/12",
    "/shop/items",
    "/shop/items/7",
    "/shop/brands",
    "/blog",
    "/blog/categories",
    "/blog/2",
  ]) {
    const anonymous = new Request("https://example.com/api" + pathname);
    const withCookie = new Request("https://example.com/api" + pathname, {
      headers: { Cookie: "auth=token" },
    });

    assert.equal(isCacheableRequest(anonymous, pathname), true, pathname);
    assert.equal(isCacheableRequest(withCookie, pathname), false, pathname);
  }
});
