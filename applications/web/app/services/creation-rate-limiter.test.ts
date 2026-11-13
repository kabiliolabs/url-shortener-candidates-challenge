import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "./creation-rate-limiter.server";

describe("InMemoryRateLimiter", () => {
  it("allows the configured attempts and returns the retry time after the limit", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    expect(limiter.consume("192.0.2.1", 1_000)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
    expect(limiter.consume("192.0.2.1", 1_000).allowed).toBe(true);
    expect(limiter.consume("192.0.2.1", 1_000)).toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });

  it("starts a new window after the previous window expires", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    limiter.consume("192.0.2.1", 1_000);

    expect(limiter.consume("192.0.2.1", 61_000)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });
  });

  it("tracks clients independently and normalizes IPv4-mapped IPv6 addresses", () => {
    const limiter = new InMemoryRateLimiter(1, 60_000);

    limiter.consume("::ffff:192.0.2.1", 1_000);

    expect(limiter.consume("192.0.2.1", 1_000).allowed).toBe(false);
    expect(limiter.consume("192.0.2.2", 1_000).allowed).toBe(true);
  });
});
