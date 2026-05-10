// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { validateUrl, shortenUrl, resolveShortCode, listUrls } from "./url.service.server";
import type { UrlRepository } from "../repositories/url.repository";

// Mock the shortcode generator
vi.mock("./shortcode.service.server", () => {
  let callCount = 0;
  return {
    generateShortCode: vi.fn(() => `code${callCount++}`),
  };
});

// Mock the logger
vi.mock("../lib/logger.server", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function createMockUrlRepo(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    findByCode: vi.fn(() => Promise.resolve(null)),
    create: vi.fn((data) =>
      Promise.resolve({
        id: 1,
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
        createdAt: new Date(),
      })
    ),
    findAllWithStats: vi.fn(() => Promise.resolve([])),
    findByCodeWithStats: vi.fn(() => Promise.resolve(null)),
    ...overrides,
  };
}

describe("URL service", () => {
  describe("validateUrl", () => {
    it("returns error for empty string", () => {
      expect(validateUrl("")).toBe("URL is required");
    });

    it("returns error for whitespace-only string", () => {
      expect(validateUrl("   ")).toBe("URL is required");
    });

    it("returns error for URL exceeding 2048 characters", () => {
      const longUrl = "https://example.com/" + "a".repeat(2030);
      expect(validateUrl(longUrl)).toBe("URL must be 2048 characters or fewer");
    });

    it("returns error for non-http protocol", () => {
      expect(validateUrl("ftp://example.com")).toBe("URL must use http or https protocol");
    });

    it("returns error for invalid URL format", () => {
      expect(validateUrl("not-a-url")).toBe("Invalid URL format");
    });

    it("returns null for valid http URL", () => {
      expect(validateUrl("http://example.com")).toBeNull();
    });

    it("returns null for valid https URL", () => {
      expect(validateUrl("https://example.com/path?q=1")).toBeNull();
    });
  });

  describe("shortenUrl", () => {
    it("creates a shortened URL successfully", async () => {
      const repo = createMockUrlRepo();
      const result = await shortenUrl("https://example.com", repo);
      expect(result).toHaveProperty("shortCode");
      expect(result).toHaveProperty("originalUrl", "https://example.com");
      expect(repo.create).toHaveBeenCalledOnce();
    });

    it("retries on P2002 collision", async () => {
      let callCount = 0;
      const repo = createMockUrlRepo({
        create: vi.fn((data) => {
          callCount++;
          if (callCount === 1) {
            const error = new Error("Unique constraint violation") as any;
            error.code = "P2002";
            return Promise.reject(error);
          }
          return Promise.resolve({
            id: 1,
            shortCode: data.shortCode,
            originalUrl: data.originalUrl,
            createdAt: new Date(),
          });
        }),
      });

      const result = await shortenUrl("https://example.com", repo);
      expect(result).toHaveProperty("shortCode");
      expect(repo.create).toHaveBeenCalledTimes(2);
    });

    it("throws after max retries exhausted", async () => {
      const repo = createMockUrlRepo({
        create: vi.fn(() => {
          const error = new Error("Unique constraint violation") as any;
          error.code = "P2002";
          return Promise.reject(error);
        }),
      });

      await expect(shortenUrl("https://example.com", repo, 3)).rejects.toThrow();
    });

    it("throws non-P2002 errors immediately", async () => {
      const repo = createMockUrlRepo({
        create: vi.fn(() => Promise.reject(new Error("DB connection failed"))),
      });

      await expect(shortenUrl("https://example.com", repo)).rejects.toThrow("DB connection failed");
      expect(repo.create).toHaveBeenCalledOnce();
    });
  });

  describe("resolveShortCode", () => {
    it("returns null for unknown code", async () => {
      const repo = createMockUrlRepo();
      const result = await resolveShortCode("unknown", repo);
      expect(result).toBeNull();
    });

    it("returns URL data for known code", async () => {
      const repo = createMockUrlRepo({
        findByCode: vi.fn(() =>
          Promise.resolve({
            id: 1,
            shortCode: "abc123",
            originalUrl: "https://example.com",
            createdAt: new Date(),
          })
        ),
      });
      const result = await resolveShortCode("abc123", repo);
      expect(result).not.toBeNull();
      expect(result!.originalUrl).toBe("https://example.com");
    });
  });

  describe("listUrls", () => {
    it("returns empty array when no URLs exist", async () => {
      const repo = createMockUrlRepo();
      const result = await listUrls(repo);
      expect(result).toEqual([]);
    });

    it("returns URLs with stats", async () => {
      const repo = createMockUrlRepo({
        findAllWithStats: vi.fn(() =>
          Promise.resolve([
            {
              id: 1,
              shortCode: "abc123",
              originalUrl: "https://example.com",
              createdAt: new Date(),
              clickCount: 42,
            },
          ])
        ),
      });
      const result = await listUrls(repo);
      expect(result).toHaveLength(1);
      expect(result[0].clickCount).toBe(42);
    });
  });
});
