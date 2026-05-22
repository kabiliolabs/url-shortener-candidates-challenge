import type { RateLimitDecision, RateLimiter } from "../domain/ports/rate-limiter";

export class TestRateLimiter implements RateLimiter {
  calls: string[] = [];
  private decision: RateLimitDecision = { allowed: true, retryAfterSeconds: 0 };

  setDecision(decision: RateLimitDecision): void {
    this.decision = decision;
  }

  async consume(key: string): Promise<RateLimitDecision> {
    this.calls.push(key);
    return this.decision;
  }
}
