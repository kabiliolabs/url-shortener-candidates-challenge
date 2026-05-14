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
    update: vi.fn().mockResolvedValue(undefined),
    findByCode: vi.fn(),
    findAll: vi.fn(),
    ...overrides,
  };
}

describe("TrackClickUseCase", () => {
  it("increments clicks on the domain entity and persists it", async () => {
    const stored = new ShortenedUrl(
      "id-1",
      ShortCode.from("abc1234"),
      OriginalUrl.fromStorage("https://example.com"),
      3,
      new Date()
    );
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(stored) });
    const useCase = new TrackClickUseCase(repository);

    await useCase.execute("abc1234");

    expect(repository.update).toHaveBeenCalledOnce();
    const updated = vi.mocked(repository.update).mock.calls[0][0];
    expect(updated.clicks).toBe(4);
  });

  it("throws UrlNotFoundError when code does not exist", async () => {
    const repository = makeRepository({ findByCode: vi.fn().mockResolvedValue(null) });
    const useCase = new TrackClickUseCase(repository);

    await expect(useCase.execute("missing")).rejects.toThrow(UrlNotFoundError);
  });
});
