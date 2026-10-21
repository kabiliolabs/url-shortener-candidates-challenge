import { systemClock, type Clock, type RateLimiter, type RateLimitResult } from "@url-shortener/engine";

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  clock?: Clock;
}

interface Window {
  count: number;
  resetsAt: number;
}

// Above this many keys we clean up expired windows, so memory doesn't grow forever.
const SWEEP_THRESHOLD = 10_000;

/**
 * Fixed-window rate limiter kept in process memory (SPEC-007).
 * Good enough for a single instance; with several replicas you'd swap in a Redis adapter.
 */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, Window>();
  private readonly clock: Clock;

  constructor(private readonly options: RateLimiterOptions) {
    this.clock = options.clock ?? systemClock;
  }

  async consume(key: string): Promise<RateLimitResult> {
    const now = this.clock.now().getTime();
    if (this.windows.size > SWEEP_THRESHOLD) this.sweep(now);

    let window = this.windows.get(key);
    if (!window || window.resetsAt <= now) {
      window = { count: 0, resetsAt: now + this.options.windowMs };
      this.windows.set(key, window);
    }

    window.count++;
    if (window.count > this.options.limit) {
      return { allowed: false, retryAfterSeconds: Math.ceil((window.resetsAt - now) / 1000) };
    }
    return { allowed: true, retryAfterSeconds: 0 };
  }

  private sweep(now: number): void {
    for (const [key, window] of this.windows) {
      if (window.resetsAt <= now) this.windows.delete(key);
    }
  }
}
