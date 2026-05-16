import type { RateLimiterPort } from "@url-shortener/engine";

// Token bucket per identifier: tracks available tokens and the last refill timestamp
type Bucket = { tokens: number; lastRefill: number };

// Token-bucket rate limiter stored entirely in memory (no external dependencies)
export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly buckets = new Map<string, Bucket>();
  // Tokens added per millisecond, derived from maxRequests / windowMs
  private readonly refillRate: number;

  constructor(
    private readonly maxRequests: number,
    windowMs: number,
  ) {
    this.refillRate = maxRequests / windowMs;
    // Periodically remove full buckets to prevent unbounded memory growth
    setInterval(() => this.purge(), windowMs * 2).unref();
  }

  // Removes buckets that have already refilled to capacity — they'd reset anyway on next access
  private purge(): void {
    const now = Date.now();
    for (const [id, bucket] of this.buckets) {
      if (bucket.tokens + (now - bucket.lastRefill) * this.refillRate >= this.maxRequests) {
        this.buckets.delete(id);
      }
    }
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    // New identifiers start with a full bucket
    const bucket = this.buckets.get(identifier) ?? { tokens: this.maxRequests, lastRefill: now };

    // Refill tokens proportional to elapsed time since last check
    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(this.maxRequests, bucket.tokens + elapsed * this.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      this.buckets.set(identifier, bucket);
      return false;
    }

    // Consume one token and allow the request
    bucket.tokens -= 1;
    this.buckets.set(identifier, bucket);
    return true;
  }
}
