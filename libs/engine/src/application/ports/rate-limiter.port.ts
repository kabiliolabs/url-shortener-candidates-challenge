export interface RateLimiterPort {
  isAllowed(identifier: string): boolean;
}
