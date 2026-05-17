import { describe, it, expect, vi } from "vitest";
import { ListUrlsUseCase } from "./list-urls.use-case";
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
    findAll: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe("ListUrlsUseCase", () => {
  it("returns all shortened URLs from the repository", async () => {
    const urls = [
      new ShortenedUrl("id-1", ShortCode.from("abc1234"), OriginalUrl.fromStorage("https://example.com"), 5, new Date()),
      new ShortenedUrl("id-2", ShortCode.from("xyz5678"), OriginalUrl.fromStorage("https://google.com"), 0, new Date()),
    ];
    const repository = makeRepository({ findAll: vi.fn().mockResolvedValue(urls) });
    const useCase = new ListUrlsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toBe(urls);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });

  it("returns an empty array when there are no URLs", async () => {
    const repository = makeRepository();
    const useCase = new ListUrlsUseCase(repository);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(repository.findAll).toHaveBeenCalledOnce();
  });
});
