import { AppError } from "@url-shortener/engine";

interface Bucket {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string): void {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || now >= existing.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return;
    }

    if (existing.count >= this.maxRequests) {
      throw new AppError(
        "RATE_LIMITED",
        "Too many requests. Please try again shortly.",
        429,
      );
    }

    existing.count += 1;
  }
}
