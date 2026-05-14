import { describe, it, expect, vi } from "vitest";
import { ShortenUrlUseCase } from "./shorten-url.use-case";
import type { UrlRepository } from "../domain/url-repository";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findByCode: vi.fn(),
    incrementClicks: vi.fn(),
    findAll: vi.fn(),
    ...overrides,
  };
}

describe("ShortenUrlUseCase", () => {
  it("saves a new shortened URL and returns it", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository);

    const result = await useCase.execute("https://example.com");

    expect(repository.save).toHaveBeenCalledOnce();
    expect(result.originalUrl.value).toBe("https://example.com/");
    expect(result.shortCode.value).toHaveLength(7);
    expect(result.clicks).toBe(0);
  });

  it("throws when URL is invalid", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository);

    await expect(useCase.execute("not-a-url")).rejects.toThrow("Invalid URL format");
    expect(repository.save).not.toHaveBeenCalled();
  });

  it("throws when URL has no valid domain", async () => {
    const repository = makeRepository();
    const useCase = new ShortenUrlUseCase(repository);

    await expect(useCase.execute("https://ww/")).rejects.toThrow("URL must have a valid domain");
    expect(repository.save).not.toHaveBeenCalled();
  });
});
