// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Redis
vi.mock("@url-shortener/database", () => ({
  redis: {},
}));

// Mock logger
vi.mock("../lib/logger.server", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Track consume calls
const mockConsume = vi.hoisted(() => vi.fn());

// Mock rate-limiter-flexible with a proper constructor
vi.mock("rate-limiter-flexible", () => {
  class MockRateLimiterRedis {
    consume = mockConsume;
  }
  class MockRateLimiterMemory {
    consume = mockConsume;
  }
  return { RateLimiterRedis: MockRateLimiterRedis, RateLimiterMemory: MockRateLimiterMemory };
});

import { rateLimitMiddleware } from "./rate-limit.server";

describe("rate limit middleware", () => {
  const mockNext = vi.fn(() => new Response("OK")) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsume.mockResolvedValue({ remainingPoints: 5 });
  });

  it("allows requests under the limit", async () => {
    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });

    const response = await rateLimitMiddleware({ request } as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(response).toBeInstanceOf(Response);
  });

  it("returns 429 when rate limit exceeded", async () => {
    mockConsume.mockRejectedValue({ msBeforeNext: 30000 });

    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });

    const response = await rateLimitMiddleware({ request } as any, mockNext);
    expect(response).toBeInstanceOf(Response);
    expect(response!.status).toBe(429);
    expect(response!.headers.get("Retry-After")).toBe("30");

    const body = await response!.json();
    expect(body.error).toBe("Too many requests");
  });

  it("returns 429 on Redis error (insuranceLimiter rejects)", async () => {
    mockConsume.mockRejectedValue({ msBeforeNext: 60000 });

    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });

    const response = await rateLimitMiddleware({ request } as any, mockNext);
    expect(response!.status).toBe(429);
  });

  it("extracts IP from x-forwarded-for header", async () => {
    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2" },
    });

    await rateLimitMiddleware({ request } as any, mockNext);
    expect(mockConsume).toHaveBeenCalledWith("10.0.0.1");
  });

  it("falls back to x-real-ip header", async () => {
    const request = new Request("http://localhost/", {
      headers: { "x-real-ip": "192.168.1.1" },
    });

    await rateLimitMiddleware({ request } as any, mockNext);
    expect(mockConsume).toHaveBeenCalledWith("192.168.1.1");
  });

  it("rate limits when no IP headers present (uses 'unknown' bucket)", async () => {
    const request = new Request("http://localhost/");

    await rateLimitMiddleware({ request } as any, mockNext);
    expect(mockConsume).toHaveBeenCalledWith("unknown");
    expect(mockNext).toHaveBeenCalled();
  });
});
