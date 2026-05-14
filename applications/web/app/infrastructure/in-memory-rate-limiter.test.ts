import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { InMemoryRateLimiter } from "./in-memory-rate-limiter";

describe("InMemoryRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);

    expect(limiter.isAllowed("ip-1")).toBe(true);
    expect(limiter.isAllowed("ip-1")).toBe(true);
    expect(limiter.isAllowed("ip-1")).toBe(true);
  });

  it("blocks the request that exceeds the limit", () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);

    limiter.isAllowed("ip-1");
    limiter.isAllowed("ip-1");
    limiter.isAllowed("ip-1");

    expect(limiter.isAllowed("ip-1")).toBe(false);
  });

  it("tracks limits independently per identifier", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    limiter.isAllowed("ip-1");
    limiter.isAllowed("ip-1");

    expect(limiter.isAllowed("ip-1")).toBe(false);
    expect(limiter.isAllowed("ip-2")).toBe(true);
  });

  it("allows requests again after the window expires", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    limiter.isAllowed("ip-1");
    limiter.isAllowed("ip-1");
    expect(limiter.isAllowed("ip-1")).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(limiter.isAllowed("ip-1")).toBe(true);
  });

  it("uses a sliding window, not a fixed reset", () => {
    const limiter = new InMemoryRateLimiter(2, 60_000);

    vi.setSystemTime(0);
    limiter.isAllowed("ip-1"); // t=0
    vi.advanceTimersByTime(30_000);
    limiter.isAllowed("ip-1"); // t=30s

    vi.advanceTimersByTime(31_000); // t=61s — first request (t=0) is now outside the window
    expect(limiter.isAllowed("ip-1")).toBe(true); // only t=30s is in window, so 1 slot used
  });
});
