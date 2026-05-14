import { InMemoryRateLimiter } from "./in-memory-rate-limiter";

export const shortenRateLimiter = new InMemoryRateLimiter(10, 60_000);
