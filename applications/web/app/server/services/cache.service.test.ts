// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock redis
const mockRedis = vi.hoisted(() => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

vi.mock("@url-shortener/database", () => ({
  redis: mockRedis,
}));

vi.mock("../lib/logger.server", () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { getCachedUrl, setCachedUrl, invalidateCachedUrl, CACHE_PREFIX, CACHE_TTL } from "./cache.service.server";

describe("cache service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCachedUrl", () => {
    it("returns cached value on hit", async () => {
      mockRedis.get.mockResolvedValue('{"id":1,"originalUrl":"https://example.com"}');
      const result = await getCachedUrl("abc123");
      expect(result).toBe('{"id":1,"originalUrl":"https://example.com"}');
      expect(mockRedis.get).toHaveBeenCalledWith(`${CACHE_PREFIX}abc123`);
    });

    it("returns null on cache miss", async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await getCachedUrl("unknown");
      expect(result).toBeNull();
    });

    it("returns null and logs error on Redis failure", async () => {
      mockRedis.get.mockRejectedValue(new Error("Redis connection refused"));
      const result = await getCachedUrl("abc123");
      expect(result).toBeNull();
    });
  });

  describe("setCachedUrl", () => {
    it("sets value with correct TTL", async () => {
      mockRedis.set.mockResolvedValue("OK");
      await setCachedUrl("abc123", "https://example.com");
      expect(mockRedis.set).toHaveBeenCalledWith(
        `${CACHE_PREFIX}abc123`,
        "https://example.com",
        "EX",
        CACHE_TTL
      );
    });

    it("does not throw on Redis failure", async () => {
      mockRedis.set.mockRejectedValue(new Error("Redis connection refused"));
      await expect(setCachedUrl("abc123", "https://example.com")).resolves.toBeUndefined();
    });
  });

  describe("invalidateCachedUrl", () => {
    it("deletes the cache key", async () => {
      mockRedis.del.mockResolvedValue(1);
      await invalidateCachedUrl("abc123");
      expect(mockRedis.del).toHaveBeenCalledWith(`${CACHE_PREFIX}abc123`);
    });

    it("does not throw on Redis failure", async () => {
      mockRedis.del.mockRejectedValue(new Error("Redis connection refused"));
      await expect(invalidateCachedUrl("abc123")).resolves.toBeUndefined();
    });
  });
});
