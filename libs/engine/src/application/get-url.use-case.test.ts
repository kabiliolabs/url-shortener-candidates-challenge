import { describe, it, expect, vi } from "vitest";
import { GetUrlUseCase } from "./get-url.use-case";
import { UrlNotFoundError } from "./url-not-found-error";
import { ShortenedUrl } from "../domain/shortened-url";
import { OriginalUrl } from "../domain/original-url";
import { ShortCode } from "../domain/short-code";
import type { UrlRepository } from "../domain/url-repository";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn(),
    findByCode: vi.fn(),
    incrementClicks: vi.fn(),
    findAll: vi.fn(),
    ...overrides,
  };
}

describe("GetUrlUseCase", () => {
  it("returns the shortened URL when found", async () => {
    const stored = new ShortenedUrl(
      "id-1",
      ShortCode.from("abc1234"),
      OriginalUrl.fromStorage("https://example.com"),
      5,
      new Date()
    );
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(stored) });
    const useCase = new GetUrlUseCase(repository);

    const result = await useCase.execute("abc1234");
    expect(result).toBe(stored);
  });

  it("throws UrlNotFoundError when code does not exist", async () => {
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(null) });
    const useCase = new GetUrlUseCase(repository);

    await expect(useCase.execute("missing")).rejects.toThrow(UrlNotFoundError);
  });
});
