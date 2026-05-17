import { describe, it, expect, vi } from "vitest";
import { TrackClickUseCase } from "./track-click.use-case";
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

describe("TrackClickUseCase", () => {
  it("returns the updated URL after an atomic click increment", async () => {
    const updated = new ShortenedUrl(
      "id-1",
      ShortCode.from("abc1234"),
      OriginalUrl.fromStorage("https://example.com"),
      4,
      new Date()
    );
    const repository = makeRepository({ incrementClicks: vi.fn().mockResolvedValue(updated) });
    const useCase = new TrackClickUseCase(repository);

    const result = await useCase.execute("abc1234");

    expect(repository.incrementClicks).toHaveBeenCalledWith("abc1234");
    expect(result.clicks).toBe(4);
  });

  it("throws UrlNotFoundError when code does not exist", async () => {
    const repository = makeRepository({ incrementClicks: vi.fn().mockResolvedValue(null) });
    const useCase = new TrackClickUseCase(repository);

    await expect(useCase.execute("missing")).rejects.toThrow(UrlNotFoundError);
  });
});
