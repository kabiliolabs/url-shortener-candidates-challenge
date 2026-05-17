import type { RateLimiterPort } from "@url-shortener/engine";

type Bucket = { tokens: number; lastRefill: number };

export class InMemoryRateLimiter implements RateLimiterPort {
  private readonly buckets = new Map<string, Bucket>();
  // tokens/ms, derived from maxRequests / windowMs
  private readonly refillRate: number;

  constructor(
    private readonly maxRequests: number,
    windowMs: number,
  ) {
    this.refillRate = maxRequests / windowMs;
    // Periodically remove full buckets to prevent unbounded memory growth
    setInterval(() => this.purge(), windowMs * 2).unref();
  }

  // Removes full buckets — they'd reset to capacity anyway on next access
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
    const bucket = this.buckets.get(identifier) ?? { tokens: this.maxRequests, lastRefill: now };

    const elapsed = now - bucket.lastRefill;
    bucket.tokens = Math.min(this.maxRequests, bucket.tokens + elapsed * this.refillRate);
    bucket.lastRefill = now;

    if (bucket.tokens < 1) {
      this.buckets.set(identifier, bucket);
      return false;
    }

    bucket.tokens -= 1;
    this.buckets.set(identifier, bucket);
    return true;
  }
}
