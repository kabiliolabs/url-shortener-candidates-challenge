export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Token-bucket-style rate limiter port.
 *
 * Implementations decide the policy (max requests, window size); callers
 * just supply an identity key (typically client IP) per request.
 */
export interface RateLimiter {
  consume(key: string): Promise<RateLimitDecision>;
}
