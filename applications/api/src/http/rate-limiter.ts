export class RateLimiter {
  private readonly requests = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  tryConsume(key: string): boolean {
    const cutoff = this.now() - this.windowMs;
    const activeRequests = (this.requests.get(key) ?? []).filter((time) => time > cutoff);

    if (activeRequests.length >= this.limit) {
      this.requests.set(key, activeRequests);
      return false;
    }

    activeRequests.push(this.now());
    this.requests.set(key, activeRequests);
    return true;
  }
}
