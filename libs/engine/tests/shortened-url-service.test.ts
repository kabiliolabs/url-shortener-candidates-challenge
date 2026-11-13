import { describe, expect, it, vi } from "vitest";
import type { ShortenedUrl } from "../src/shortened-url";
import type { ShortCodeGenerator } from "../src/short-code-generator";
import {
  OriginalUrlConflictError,
  ShortCodeConflictError,
  type NewShortenedUrl,
  type ShortenedUrlPage,
  type ShortenedUrlPageQuery,
  type ShortenedUrlRepository,
} from "../src/shortened-url-repository";
import {
  ShortCodeGenerationError,
  ShortenedUrlService,
} from "../src/shortened-url-service";

const createdAt = new Date("2026-01-01T00:00:00.000Z");
const normalizedUrl = "https://example.com/";
const existingUrl: ShortenedUrl = {
  code: "existing1",
  originalUrl: normalizedUrl,
  createdAt,
  clickCount: 0,
};

function createRepository() {
  return {
    create: vi.fn(
      async ({ code, originalUrl }: NewShortenedUrl): Promise<ShortenedUrl> => ({
        code,
        originalUrl,
        createdAt,
        clickCount: 0,
      }),
    ),
    findByCodeAndRecordClick: vi.fn(
      async (_code: string): Promise<ShortenedUrl | null> => null,
    ),
    findByOriginalUrl: vi.fn(
      async (_originalUrl: string): Promise<ShortenedUrl | null> => null,
    ),
    findPage: vi.fn(
      async (_query: ShortenedUrlPageQuery): Promise<ShortenedUrlPage> => ({
        shortenedUrls: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 1,
      }),
    ),
  } satisfies ShortenedUrlRepository;
}

function createGenerator(...codes: string[]): ShortCodeGenerator & {
  generate: ReturnType<typeof vi.fn>;
} {
  const generatedCodes = [...codes];

  return {
    generate: vi.fn(() => generatedCodes.shift() ?? "fallback1"),
  };
}

describe("ShortenedUrlService.shorten", () => {
  it("creates a shortened URL using the normalized destination", async () => {
    const repository = createRepository();
    const generator = createGenerator("short123");
    const service = new ShortenedUrlService(repository, generator);

    const result = await service.shorten(" HTTPS://Example.com ");

    expect(result).toEqual({
      code: "short123",
      originalUrl: normalizedUrl,
      createdAt,
      clickCount: 0,
    });
    expect(repository.create).toHaveBeenCalledWith({
      code: "short123",
      originalUrl: normalizedUrl,
    });
  });

  it("returns an existing shortened URL without generating a code", async () => {
    const repository = createRepository();
    repository.findByOriginalUrl.mockResolvedValue(existingUrl);
    const generator = createGenerator();
    const service = new ShortenedUrlService(repository, generator);

    const result = await service.shorten(normalizedUrl);

    expect(result).toBe(existingUrl);
    expect(repository.create).not.toHaveBeenCalled();
    expect(generator.generate).not.toHaveBeenCalled();
  });

  it("returns the record created by a concurrent request", async () => {
    const repository = createRepository();
    repository.findByOriginalUrl
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingUrl);
    repository.create.mockRejectedValueOnce(new OriginalUrlConflictError());
    const service = new ShortenedUrlService(
      repository,
      createGenerator("short123"),
    );

    const result = await service.shorten(normalizedUrl);

    expect(result).toBe(existingUrl);
    expect(repository.findByOriginalUrl).toHaveBeenCalledTimes(2);
  });

  it("retries when the generated short code conflicts", async () => {
    const repository = createRepository();
    const createdUrl: ShortenedUrl = {
      code: "second12",
      originalUrl: normalizedUrl,
      createdAt,
      clickCount: 0,
    };
    repository.create
      .mockRejectedValueOnce(new ShortCodeConflictError())
      .mockResolvedValueOnce(createdUrl);
    const generator = createGenerator("first123", "second12");
    const service = new ShortenedUrlService(repository, generator);

    const result = await service.shorten(normalizedUrl);

    expect(result).toBe(createdUrl);
    expect(repository.create).toHaveBeenCalledTimes(2);
    expect(generator.generate).toHaveBeenCalledTimes(2);
  });

  it("fails after the maximum number of code conflicts", async () => {
    const repository = createRepository();
    repository.create.mockRejectedValue(new ShortCodeConflictError());
    const generator = createGenerator("samecode");
    const service = new ShortenedUrlService(repository, generator);

    await expect(service.shorten(normalizedUrl)).rejects.toBeInstanceOf(
      ShortCodeGenerationError,
    );
    expect(repository.create).toHaveBeenCalledTimes(3);
    expect(generator.generate).toHaveBeenCalledTimes(3);
  });
});
