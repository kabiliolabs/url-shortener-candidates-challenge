import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../domain/short-url", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../domain/short-url")>();
  return { ...actual, generateShortCode: vi.fn(actual.generateShortCode) };
});

import {
  InvalidUrlError,
  ShortCodeCollisionError,
  ShortCodeExhaustedError,
  ShortUrlNotFoundError,
} from "../domain/errors";
import type { CreateShortUrlInput, IShortUrlRepository } from "../domain/repository";
import { generateShortCode, type ShortUrl } from "../domain/short-url";
import { ShortUrlService } from "./short-url-service";

class FakeShortUrlRepository implements IShortUrlRepository {
  private readonly store = new Map<string, ShortUrl>();
  private idCounter = 0;

  async create(input: CreateShortUrlInput): Promise<ShortUrl> {
    if (this.store.has(input.code)) {
      throw new ShortCodeCollisionError(input.code);
    }
    const entity: ShortUrl = {
      id: String(++this.idCounter),
      code: input.code,
      originalUrl: input.originalUrl,
      clickCount: 0,
      lastClickedAt: null,
      createdAt: new Date(),
    };
    this.store.set(input.code, entity);
    return entity;
  }

  async findByCode(code: string): Promise<ShortUrl | null> {
    return this.store.get(code) ?? null;
  }

  async list(): Promise<ShortUrl[]> {
    return Array.from(this.store.values());
  }

  async incrementClick(code: string): Promise<ShortUrl> {
    const entity = this.store.get(code);
    if (!entity) throw new ShortUrlNotFoundError(code);
    entity.clickCount += 1;
    entity.lastClickedAt = new Date();
    return entity;
  }
}

describe("ShortUrlService.createShortUrl", () => {
  let repository: FakeShortUrlRepository;
  let service: ShortUrlService;

  beforeEach(() => {
    repository = new FakeShortUrlRepository();
    service = new ShortUrlService(repository);
    vi.mocked(generateShortCode).mockReset();
  });

  it("creates a short url for a valid URL", async () => {
    vi.mocked(generateShortCode).mockReturnValue("abc1234");

    const { shortUrl, shortenedUrl } = await service.createShortUrl(
      "https://example.com",
      "http://localhost:5173",
    );

    expect(shortUrl.code).toBe("abc1234");
    expect(shortUrl.originalUrl).toBe("https://example.com/");
    expect(shortenedUrl).toBe("http://localhost:5173/s/abc1234");
  });

  it("propagates InvalidUrlError for a bad URL without touching the repository", async () => {
    await expect(
      service.createShortUrl("not-a-url", "http://localhost:5173"),
    ).rejects.toThrow(InvalidUrlError);
    expect(await repository.list()).toHaveLength(0);
  });

  it("retries on collision and eventually succeeds", async () => {
    await repository.create({ code: "dup0001", originalUrl: "https://taken.example.com" });
    vi.mocked(generateShortCode)
      .mockReturnValueOnce("dup0001")
      .mockReturnValueOnce("dup0001")
      .mockReturnValueOnce("free001");

    const { shortUrl } = await service.createShortUrl(
      "https://example.com",
      "http://localhost:5173",
    );

    expect(shortUrl.code).toBe("free001");
    expect(generateShortCode).toHaveBeenCalledTimes(3);
  });

  it("throws ShortCodeExhaustedError after exhausting retries", async () => {
    await repository.create({ code: "dup0001", originalUrl: "https://taken.example.com" });
    vi.mocked(generateShortCode).mockReturnValue("dup0001");

    await expect(
      service.createShortUrl("https://example.com", "http://localhost:5173"),
    ).rejects.toThrow(ShortCodeExhaustedError);
  });
});

describe("ShortUrlService.recordClickAndResolve", () => {
  it("increments click stats and returns the destination for a known code", async () => {
    const repository = new FakeShortUrlRepository();
    const service = new ShortUrlService(repository);
    await repository.create({ code: "abc1234", originalUrl: "https://example.com/" });

    const destination = await service.recordClickAndResolve("abc1234");

    expect(destination).toBe("https://example.com/");
    const entity = await repository.findByCode("abc1234");
    expect(entity?.clickCount).toBe(1);
    expect(entity?.lastClickedAt).not.toBeNull();
  });

  it("throws ShortUrlNotFoundError for an unknown code without changing any stats", async () => {
    const repository = new FakeShortUrlRepository();
    const service = new ShortUrlService(repository);

    await expect(service.recordClickAndResolve("missing")).rejects.toThrow(
      ShortUrlNotFoundError,
    );
    expect(await repository.list()).toHaveLength(0);
  });
});

describe("ShortUrlService.listShortUrls", () => {
  it("returns all stored entries", async () => {
    const repository = new FakeShortUrlRepository();
    const service = new ShortUrlService(repository);
    await repository.create({ code: "abc1234", originalUrl: "https://example.com/" });

    const urls = await service.listShortUrls();

    expect(urls).toHaveLength(1);
  });
});
