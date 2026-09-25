import { describe, expect, it } from "vitest";
import { checkRateLimit } from "./rate-limit.server";

describe("checkRateLimit", () => {
  it("allows requests within the limit", () => {
    const key = `test-within-${Math.random()}`;
    const now = 1_000_000;

    for (let i = 0; i < 10; i++) {
      expect(checkRateLimit(key, now + i).allowed).toBe(true);
    }
  });

  it("rejects the 11th request within the same window", () => {
    const key = `test-exceed-${Math.random()}`;
    const now = 2_000_000;

    for (let i = 0; i < 10; i++) {
      checkRateLimit(key, now + i);
    }

    const result = checkRateLimit(key, now + 10);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows requests again once the window has passed", () => {
    const key = `test-reset-${Math.random()}`;
    const now = 3_000_000;

    for (let i = 0; i < 10; i++) {
      checkRateLimit(key, now + i);
    }
    expect(checkRateLimit(key, now + 10).allowed).toBe(false);

    // 60_001ms after the first request in the window, it has fully expired
    expect(checkRateLimit(key, now + 60_001).allowed).toBe(true);
  });

  it("tracks separate keys independently", () => {
    const now = 4_000_000;
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;

    for (let i = 0; i < 10; i++) {
      checkRateLimit(keyA, now + i);
    }

    expect(checkRateLimit(keyA, now + 10).allowed).toBe(false);
    expect(checkRateLimit(keyB, now + 10).allowed).toBe(true);
  });
});
