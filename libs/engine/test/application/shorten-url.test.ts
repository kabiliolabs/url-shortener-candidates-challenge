import { beforeEach, describe, expect, it } from "vitest";
import {
  RateLimitExceededError,
  ShortCodeCollisionError,
  ShortenUrl,
} from "../../src";
import {
  FixedClock,
  InMemoryShortUrlRepository,
  SequenceCodeGenerator,
  StubRateLimiter,
} from "../fakes";

describe("ShortenUrl", () => {
  let repository: InMemoryShortUrlRepository;
  let rateLimiter: StubRateLimiter;
  let clock: FixedClock;

  const build = (codes = ["aaaaaa1", "aaaaaa2", "aaaaaa3"]) =>
    new ShortenUrl({
      repository,
      codeGenerator: new SequenceCodeGenerator(codes),
      rateLimiter,
      clock,
      ownHost: "short.ly",
    });

  beforeEach(() => {
    repository = new InMemoryShortUrlRepository();
    rateLimiter = new StubRateLimiter();
    clock = new FixedClock();
  });

  describe("SPEC-001: Shorten a URL", () => {
    it("stores a new short URL with zero clicks", async () => {
      const result = await build().execute({ url: "example.com", clientId: "1.2.3.4" });

      expect(result).toEqual({
        code: "aaaaaa1",
        originalUrl: "https://example.com/",
        clicks: 0,
        createdAt: clock.current,
        lastClickedAt: null,
      });
      expect(repository.items.has("aaaaaa1")).toBe(true);
    });

    it("gives a different code when the same URL is shortened twice", async () => {
      const useCase = build();
      const first = await useCase.execute({ url: "https://example.com", clientId: "x" });
      const second = await useCase.execute({ url: "https://example.com", clientId: "x" });

      expect(first.code).not.toBe(second.code);
      expect(repository.items.size).toBe(2);
    });

    it("doesn't store anything when the URL is invalid", async () => {
      await expect(
        build().execute({ url: "javascript:alert(1)", clientId: "x" }),
      ).rejects.toMatchObject({ code: "INVALID_URL", reason: "unsupported_scheme" });
      expect(repository.items.size).toBe(0);
    });
  });

  describe("SPEC-002: Validate the URL", () => {
    it("rejects links to our own domain", async () => {
      await expect(
        build().execute({ url: "https://short.ly/s/abcdefg", clientId: "x" }),
      ).rejects.toMatchObject({ reason: "own_domain" });
    });
  });

  describe("SPEC-003: Unique short codes", () => {
    it("retries with a new code on collision", async () => {
      const useCase = build(["aaaaaa1", "aaaaaa1", "bbbbbb2"]);
      await useCase.execute({ url: "https://one.com", clientId: "x" });

      const second = await useCase.execute({ url: "https://two.com", clientId: "x" });

      expect(second.code).toBe("bbbbbb2");
    });

    it("gives up after 5 attempts", async () => {
      await build(["aaaaaa1"]).execute({ url: "https://one.com", clientId: "x" });

      await expect(
        build(["aaaaaa1"]).execute({ url: "https://two.com", clientId: "x" }),
      ).rejects.toThrow(ShortCodeCollisionError);
    });
  });

  describe("SPEC-007: Abuse prevention", () => {
    it("rate limits by client id", async () => {
      await build().execute({ url: "https://example.com", clientId: "1.2.3.4" });

      expect(rateLimiter.keys).toEqual(["shorten:1.2.3.4"]);
    });

    it("rejects the request when the limit is exceeded", async () => {
      rateLimiter.result = { allowed: false, retryAfterSeconds: 42 };

      const promise = build().execute({ url: "https://example.com", clientId: "x" });

      await expect(promise).rejects.toThrow(RateLimitExceededError);
      await expect(promise).rejects.toMatchObject({ retryAfterSeconds: 42 });
      expect(repository.items.size).toBe(0);
    });
  });
});
