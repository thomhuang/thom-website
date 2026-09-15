import assert from "node:assert/strict";
import test from "node:test";

import { stripApiPrefix } from "./index.js";

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
