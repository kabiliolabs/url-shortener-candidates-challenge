import { RateLimitError } from './errors.js';

const LIMIT = 10;
const WINDOW_MS = 60_000;

const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): void {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (entry.count >= LIMIT) throw new RateLimitError();

  entry.count++;
}
