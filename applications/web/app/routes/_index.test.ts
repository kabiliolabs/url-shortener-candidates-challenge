// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the repository module BEFORE importing the route
vi.mock("~/server/repositories/index.server", () => ({
  urlRepository: {
    findByCode: vi.fn(),
    create: vi.fn((data: any) =>
      Promise.resolve({
        id: 1,
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
        createdAt: new Date(),
      })
    ),
    findAllWithStats: vi.fn(() => Promise.resolve([])),
    findByCodeWithStats: vi.fn(),
  },
  clickRepository: {
    getClicksByDay: vi.fn(() => Promise.resolve([])),
    getClicksByDayForUrls: vi.fn(() => Promise.resolve([])),
    record: vi.fn(),
  },
}));

// Mock shortcode generator for deterministic results
vi.mock("~/server/services/shortcode.service.server", () => ({
  generateShortCode: vi.fn(() => "testcode01"),
}));

// Mock logger
vi.mock("~/server/lib/logger.server", () => ({
  logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

// Mock reCAPTCHA verification to always succeed
vi.mock("~/server/services/recaptcha.service.server", () => ({
  verifyRecaptcha: vi.fn(() => Promise.resolve({ success: true, score: 1.0 })),
}));

import { loader, action } from "./_index";

describe("_index route", () => {
  describe("loader", () => {
    it("returns baseUrl and urls array", async () => {
      const result = await loader();
      expect(result).toHaveProperty("baseUrl");
      expect(result.baseUrl).toContain("/s/");
      expect(result).toHaveProperty("urls");
      expect(Array.isArray(result.urls)).toBe(true);
    });
  });

  describe("action", () => {
    it("returns error when recaptcha token is missing", async () => {
      const formData = new FormData();
      formData.set("url", "https://example.com");
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toEqual({
        error: "Bot verification failed — please try again",
      });
    });

    it("returns error when URL is missing", async () => {
      const formData = new FormData();
      formData.set("recaptcha_token", "test-token");
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toEqual({ error: "URL is required" });
    });

    it("returns error for invalid protocol", async () => {
      const formData = new FormData();
      formData.set("recaptcha_token", "test-token");
      formData.set("url", "ftp://example.com");
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toHaveProperty("error");
      expect(result.error).toContain("http");
    });

    it("returns shortenedUrl for valid input", async () => {
      const formData = new FormData();
      formData.set("recaptcha_token", "test-token");
      formData.set("url", "https://example.com");
      const request = new Request("http://localhost/", {
        method: "POST",
        body: formData,
      });

      const result = await action({
        request,
        params: {},
        context: {} as never,
        url: new URL(request.url),
        pattern: "/",
      } as any);
      expect(result).toHaveProperty("shortenedUrl");
      expect(result.shortenedUrl).toContain("/s/");
    });
  });
});
