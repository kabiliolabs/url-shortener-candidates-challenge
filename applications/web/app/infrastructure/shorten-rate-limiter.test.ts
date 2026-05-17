import { describe, it, expect, vi, afterAll } from "vitest";
import { shortenRateLimiter } from "./shorten-rate-limiter";

afterAll(() => vi.useRealTimers());

describe("shortenRateLimiter", () => {
  it("allows requests up to the configured limit", () => {
    expect(shortenRateLimiter.isAllowed("test-client")).toBe(true);
  });
});
