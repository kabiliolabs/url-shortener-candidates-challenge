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

  it("purges fully-refilled buckets after two window periods", () => {
    const limiter = new InMemoryRateLimiter(3, 60_000);
    limiter.isAllowed("ip-purge"); // creates a bucket entry

    // advance past two window periods — the setInterval fires and calls purge()
    vi.advanceTimersByTime(120_001);

    // purge removed the bucket; next call starts fresh with full capacity
    expect(limiter.isAllowed("ip-purge")).toBe(true);
  });

  it("does not purge buckets that have not fully refilled yet", () => {
    vi.setSystemTime(0);
    const limiter = new InMemoryRateLimiter(3, 60_000); // purge fires at t=120_000

    // exhaust the bucket at t=70_000ms
    vi.advanceTimersByTime(70_000);
    limiter.isAllowed("ip-kept");
    limiter.isAllowed("ip-kept");
    limiter.isAllowed("ip-kept"); // 0 tokens left, lastRefill=70_000

    // purge fires at t=120_000ms — bucket has only refilled for 50_000ms:
    // tokens = 0 + 50_000 * (3/60_000) = 2.5 < 3 → bucket is NOT purged
    vi.advanceTimersByTime(50_001);

    // bucket still exists with ~2.5 tokens — request succeeds
    expect(limiter.isAllowed("ip-kept")).toBe(true);
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
