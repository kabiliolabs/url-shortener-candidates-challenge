import type { Route } from "../../+types/root";
import { redis } from "@url-shortener/database";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { logger } from "../lib/logger.server";

const postLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:post",
  points: 10,
  duration: 60,
});

const getLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "rl:get",
  points: 100,
  duration: 60,
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function selectLimiter(request: Request) {
  const url = new URL(request.url);
  if (request.method === "POST") return postLimiter;
  if (request.method === "GET" && url.pathname.startsWith("/s/")) return getLimiter;

  return getLimiter;
}

export const rateLimitMiddleware: Route.MiddlewareFunction = async (
  { request },
  next
) => {
  const ip = getClientIp(request);

  if (ip === "unknown") {
    logger.warn("No client IP detected, skipping rate limit");
    return next();
  }

  const limiter = selectLimiter(request);

  try {
    await limiter.consume(ip);
  } catch (error) {
    if (error instanceof Error) {
      // Redis connection error — allow the request through
      logger.warn({ err: error }, "Rate limiter Redis error, allowing request");
      return next();
    }

    // RateLimiterRes — rate limit exceeded
    const rateLimiterRes = error as { msBeforeNext?: number };
    const retryAfter = Math.ceil((rateLimiterRes.msBeforeNext ?? 60000) / 1000);

    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
      },
    });
  }

  return next();
};
