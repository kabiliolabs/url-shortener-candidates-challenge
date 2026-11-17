export interface RateLimitDecision {
  allowed: boolean;
  /** Seconds until the current window ends. 0 when the request is allowed. */
  retryAfterSeconds: number;
}

interface Window {
  startedAt: number;
  count: number;
}

/**
 * Fixed-window counter per key. Deliberately generic: it knows nothing about
 * HTTP or about who a "client" is, which is the caller's decision.
 *
 * Kept simple on purpose, with two known limits:
 * - Entries are never evicted, so memory grows with the number of distinct
 *   keys seen.
 * - The counters live in this process, so several instances would each count
 *   on their own.
 * In production both are solved by a shared store such as Redis, with a TTL
 * equal to the window.
 */
export class InMemoryRateLimiter {
  private readonly windows = new Map<string, Window>();
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  // The clock is injected so tests can move time forward without waiting.
  constructor(options: {
    limit: number;
    windowMs: number;
    now?: () => number;
  }) {
    this.limit = options.limit;
    this.windowMs = options.windowMs;
    this.now = options.now ?? Date.now;
  }

  tryConsume(key: string): RateLimitDecision {
    const now = this.now();
    let window = this.windows.get(key);

    if (!window || now - window.startedAt >= this.windowMs) {
      window = { startedAt: now, count: 0 };
      this.windows.set(key, window);
    }

    if (window.count >= this.limit) {
      const remainingMs = window.startedAt + this.windowMs - now;
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil(remainingMs / 1000),
      };
    }

    window.count++;
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
