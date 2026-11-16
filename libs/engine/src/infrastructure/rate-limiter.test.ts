import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter, RateLimitExceededError } from "./rate-limiter";

function limiterAt(clock: { now: number }) {
  return createRateLimiter({ limit: 2, windowMs: 60_000, now: () => clock.now });
}

describe("createRateLimiter", () => {
  it("allows up to the limit, then rejects with the seconds left in the window", () => {
    const clock = { now: 0 };
    const check = limiterAt(clock);

    check("a");
    check("a");
    clock.now = 15_000;

    expect(() => check("a")).toThrow(new RateLimitExceededError(45));
  });

  it("tracks clients independently", () => {
    const check = limiterAt({ now: 0 });

    check("a");
    check("a");

    expect(() => check("b")).not.toThrow();
  });

  it("resets once the window has elapsed", () => {
    const clock = { now: 0 };
    const check = limiterAt(clock);
    check("a");
    check("a");

    clock.now = 60_000;

    expect(() => check("a")).not.toThrow();
  });
});

describe("clientKey", () => {
  it("uses the first X-Forwarded-For hop, falling back to a shared key", () => {
    const forwarded = new Request("http://x", {
      headers: { "X-Forwarded-For": "203.0.113.7, 10.0.0.1" },
    });

    expect(clientKey(forwarded)).toBe("203.0.113.7");
    expect(clientKey(new Request("http://x"))).toBe("anonymous");
  });
});
