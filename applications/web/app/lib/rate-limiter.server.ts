export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * In-memory sliding-window limiter: at most `limit` hits per `windowMs` per key.
 * Only accepted requests are recorded, so a blocked client recovers on schedule.
 */
export class SlidingWindowRateLimiter {
  private static readonly MAX_KEYS = 10_000;
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(key: string, now = Date.now()): RateLimitResult {
    const recent = (this.hits.get(key) ?? []).filter((t) => t > now - this.windowMs);

    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((recent[0] + this.windowMs - now) / 1000),
      );
      return { allowed: false, retryAfterSeconds };
    }

    recent.push(now);
    this.hits.set(key, recent);
    this.pruneIfLarge(now);
    return { allowed: true, retryAfterSeconds: 0 };
  }

  /** Bounds memory: drop keys whose hits have all expired once the map grows too big. */
  private pruneIfLarge(now: number) {
    if (this.hits.size <= SlidingWindowRateLimiter.MAX_KEYS) return;
    for (const [key, times] of this.hits) {
      if (times[times.length - 1] <= now - this.windowMs) this.hits.delete(key);
    }
  }
}

// One shared instance, kept across dev hot reloads: 10 new links per minute per IP.
const globalForLimiter = globalThis as unknown as {
  createLinkLimiter?: SlidingWindowRateLimiter;
};
export const createLinkLimiter = (globalForLimiter.createLinkLimiter ??=
  new SlidingWindowRateLimiter(10, 60_000));

/**
 * Best-effort client IP. X-Forwarded-For is only trustworthy behind a reverse
 * proxy that sets it; without one a client could spoof it to dodge the limit.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}