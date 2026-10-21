export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the next request would be allowed. 0 when allowed. */
  retryAfterSeconds: number;
}

/**
 * Port for abuse protection (SPEC-007). Async so a Redis-backed adapter can drop in later
 * without touching the use cases.
 */
export interface RateLimiter {
  /** Counts one hit for `key` and tells whether it's within the limit. */
  consume(key: string): Promise<RateLimitResult>;
}
