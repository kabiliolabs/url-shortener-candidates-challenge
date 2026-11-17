import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";

const WINDOW_MS = 60_000;

function setup(limit: number) {
  const clock = { now: 0 };
  const limiter = new InMemoryRateLimiter({
    limit,
    windowMs: WINDOW_MS,
    now: () => clock.now,
  });
  return { clock, limiter };
}

describe("InMemoryRateLimiter", () => {
  it("allows up to the limit and rejects the next request", () => {
    const { clock, limiter } = setup(3);

    for (let i = 0; i < 3; i++) {
      expect(limiter.tryConsume("client")).toEqual({
        allowed: true,
        retryAfterSeconds: 0,
      });
    }

    clock.now = 15_000;
    expect(limiter.tryConsume("client")).toEqual({
      allowed: false,
      retryAfterSeconds: 45,
    });
  });

  it("counts each key separately", () => {
    const { limiter } = setup(1);

    expect(limiter.tryConsume("first").allowed).toBe(true);
    expect(limiter.tryConsume("first").allowed).toBe(false);
    expect(limiter.tryConsume("second").allowed).toBe(true);
  });

  it("starts a new window once the current one has passed", () => {
    const { clock, limiter } = setup(1);
    limiter.tryConsume("client");

    clock.now = WINDOW_MS - 1;
    expect(limiter.tryConsume("client").allowed).toBe(false);

    clock.now = WINDOW_MS;
    expect(limiter.tryConsume("client").allowed).toBe(true);
    expect(limiter.tryConsume("client").allowed).toBe(false);
  });
});
