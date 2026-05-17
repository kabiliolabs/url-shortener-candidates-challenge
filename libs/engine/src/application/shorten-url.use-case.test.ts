import { describe, it, expect, vi } from "vitest";
import { ShortenUrlUseCase } from "./shorten-url.use-case";
import { RateLimitExceededError } from "./rate-limit-exceeded-error";
import type { UrlRepository } from "../domain/url-repository.port";
import type { RateLimiterPort } from "./ports/rate-limiter.port";
import { ShortenedUrl } from "../domain/shortened-url";
import { ShortCode } from "../domain/short-code";
import { OriginalUrl } from "../domain/original-url";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    incrementClicks: vi.fn(),
    findByCode: vi.fn().mockResolvedValue(null),
    findByOriginalUrl: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

function makeRateLimiter(allowed = true): RateLimiterPort {
  return { isAllowed: vi.fn().mockReturnValue(allowed) };
}

describe("ShortenUrlUseCase", () => {
  it("saves a new shortened URL and returns it", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository, makeRateLimiter());

    const result = await useCase.execute("https://example.com", "127.0.0.1");

    expect(repository.save).toHaveBeenCalledOnce();
    expect(result.originalUrl.value).toBe("https://example.com/");
    expect(result.shortCode.value).toHaveLength(7);
    expect(result.clicks).toBe(0);
  });

  it("throws when URL is invalid", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository, makeRateLimiter());

    await expect(useCase.execute("not-a-url", "127.0.0.1")).rejects.toThrow("Invalid URL format");
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws when URL has no valid domain", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository, makeRateLimiter());

    await expect(useCase.execute("https://ww/", "127.0.0.1")).rejects.toThrow("URL must have a valid domain");
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws RateLimitExceededError when rate limit is exceeded", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository, makeRateLimiter(false));

    await expect(useCase.execute("https://example.com", "127.0.0.1")).rejects.toThrow(RateLimitExceededError);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("returns existing URL without saving when original URL already exists", async () => {
    const existing = new ShortenedUrl(
      "existing-id",
      ShortCode.from("abc1234"),
      OriginalUrl.fromStorage("https://example.com/"),
      5,
      new Date(),
    );
    const repository = makeRepository({
      findByOriginalUrl: vi.fn().mockResolvedValue(existing),
    });
    const useCase = new ShortenUrlUseCase(repository, makeRateLimiter());

    const result = await useCase.execute("https://example.com", "127.0.0.1");

    expect(repository.findByOriginalUrl).toHaveBeenCalledWith("https://example.com/");
    expect(repository.save).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });
});
