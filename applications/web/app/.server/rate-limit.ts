// In-memory token-bucket rate limiter, keyed by client IP. Sized for this
// challenge's single-process deployment — a distributed limiter (Redis) would
// be the next step for multi-instance scale.

export type RateLimiterOptions = {
  capacity: number;
  refillPerSecond: number;
  now?: () => number;
};

export type RateLimiter = {
  tryConsume(key: string): boolean;
};

type Bucket = {
  tokens: number;
  lastRefill: number;
};

export function createRateLimiter({
  capacity,
  refillPerSecond,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    tryConsume(key: string): boolean {
      const timestamp = now();
      const bucket = buckets.get(key) ?? {
        tokens: capacity,
        lastRefill: timestamp,
      };

      const elapsedSeconds = (timestamp - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(
        capacity,
        bucket.tokens + elapsedSeconds * refillPerSecond,
      );
      bucket.lastRefill = timestamp;

      const allowed = bucket.tokens >= 1;
      if (allowed) {
        bucket.tokens -= 1;
      }

      buckets.set(key, bucket);
      return allowed;
    },
  };
}

// Honors the first X-Forwarded-For hop, then X-Real-IP. Without a proxy
// setting either header, callers share the "unknown" bucket.
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Singleton limiter for the create action: ~10 request burst, replenishing one
 * token roughly every 3 seconds (~20/min sustained). Deliberately applied to
 * creation only — the redirect path is never rate-limited so a popular link
 * never serves 429s to ordinary visitors.
 */
export const createShortUrlRateLimiter = createRateLimiter({
  capacity: 10,
  refillPerSecond: 1 / 3,
});
