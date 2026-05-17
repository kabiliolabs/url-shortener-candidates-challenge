import { describe, it, expect, vi } from "vitest";
import { FindUrlByCodeUseCase } from "./find-url-by-code.use-case";
import { UrlNotFoundError } from "./url-not-found-error";
import { ShortenedUrl } from "../domain/shortened-url";
import { OriginalUrl } from "../domain/original-url";
import { ShortCode } from "../domain/short-code";
import type { UrlRepository } from "../domain/url-repository.port";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn(),
    incrementClicks: vi.fn(),
    findByCode: vi.fn(),
    findByOriginalUrl: vi.fn(),
    findAll: vi.fn(),
    ...overrides,
  };
}

describe("FindUrlByCodeUseCase", () => {
  it("returns the shortened URL when found", async () => {
    const stored = new ShortenedUrl(
      "id-1",
      ShortCode.from("abc1234"),
      OriginalUrl.fromStorage("https://example.com"),
      5,
      new Date()
    );
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(stored) });
    const useCase = new FindUrlByCodeUseCase(repository);

    const result = await useCase.execute("abc1234");
    expect(result).toBe(stored);
  });

  it("throws UrlNotFoundError when code does not exist", async () => {
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(null) });
    const useCase = new FindUrlByCodeUseCase(repository);

    await expect(useCase.execute("missing")).rejects.toThrow(UrlNotFoundError);
  });
});
