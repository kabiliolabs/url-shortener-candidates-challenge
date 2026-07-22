import assert from "node:assert/strict";
import test from "node:test";
import { RateLimiter } from "../dist/http/rate-limiter.js";

test("limits requests within its configured time window", () => {
  let now = 1_000;
  const limiter = new RateLimiter(2, 60_000, () => now);

  assert.equal(limiter.tryConsume("127.0.0.1"), true);
  assert.equal(limiter.tryConsume("127.0.0.1"), true);
  assert.equal(limiter.tryConsume("127.0.0.1"), false);

  now += 60_001;
  assert.equal(limiter.tryConsume("127.0.0.1"), true);
});
