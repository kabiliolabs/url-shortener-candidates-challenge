import { describe, it, expect, vi } from "vitest";
import { ShortenUrlUseCase } from "./shorten-url.use-case";
import { RateLimitExceededError } from "./rate-limit-exceeded-error";
import type { UrlRepository } from "../domain/url-repository";
import type { RateLimiterPort } from "./ports/rate-limiter.port";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findByCode: vi.fn(),
    incrementClicks: vi.fn(),
    findAll: vi.fn(),
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
});
