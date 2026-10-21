import type { Clock } from "@url-shortener/engine";
import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter } from "../src";

function fakeClock(start = 0) {
  let now = start;
  const clock: Clock = { now: () => new Date(now) };
  return { clock, advance: (ms: number) => (now += ms) };
}

describe("SPEC-007: Abuse prevention (InMemoryRateLimiter)", () => {
  it("allows up to the limit and then blocks", async () => {
    const { clock } = fakeClock();
    const limiter = new InMemoryRateLimiter({ limit: 3, windowMs: 60_000, clock });

    const results = [];
    for (let i = 0; i < 4; i++) results.push(await limiter.consume("ip"));

    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false]);
    expect(results[3].retryAfterSeconds).toBe(60);
  });

  it("tells how long to wait and resets after the window", async () => {
    const { clock, advance } = fakeClock();
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000, clock });
    await limiter.consume("ip");

    advance(45_000);
    expect(await limiter.consume("ip")).toEqual({ allowed: false, retryAfterSeconds: 15 });

    advance(15_000);
    expect(await limiter.consume("ip")).toEqual({ allowed: true, retryAfterSeconds: 0 });
  });

  it("keeps a separate counter per key", async () => {
    const { clock } = fakeClock();
    const limiter = new InMemoryRateLimiter({ limit: 1, windowMs: 60_000, clock });

    await limiter.consume("ip-a");

    expect((await limiter.consume("ip-b")).allowed).toBe(true);
  });
});
