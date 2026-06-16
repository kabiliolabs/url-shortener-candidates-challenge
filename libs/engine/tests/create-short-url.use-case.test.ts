import { describe, expect, it } from "vitest";
import {
  CreateShortUrlUseCase,
  DuplicateShortCodeError,
  type ShortCodeGenerator,
  type ShortUrlRepository,
  type UrlStatsItem,
  ShortUrl,
  OriginalUrl,
  ShortCode,
} from "../src";

class InMemoryRepository implements ShortUrlRepository {
  private readonly storage = new Map<string, ShortUrl>();

  async create(input: { shortCode: string; originalUrl: string }): Promise<ShortUrl> {
    if (this.storage.has(input.shortCode)) {
      throw new DuplicateShortCodeError();
    }

    const row = new ShortUrl({
      id: crypto.randomUUID(),
      shortCode: ShortCode.create(input.shortCode),
      originalUrl: OriginalUrl.create(input.originalUrl),
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastClickedAt: null,
    });

    this.storage.set(input.shortCode, row);
    return row;
  }

  async findByCode(shortCode: string): Promise<ShortUrl | null> {
    return this.storage.get(shortCode) ?? null;
  }

  async existsByCode(shortCode: string): Promise<boolean> {
    return this.storage.has(shortCode);
  }

  async incrementClickCount(shortCode: string, clickedAt: Date): Promise<void> {
    const current = this.storage.get(shortCode);
    if (!current) {
      return;
    }

    this.storage.set(
      shortCode,
      new ShortUrl({
        id: current.id,
        shortCode: current.shortCode,
        originalUrl: current.originalUrl,
        clickCount: current.clickCount + 1,
        createdAt: current.createdAt,
        updatedAt: clickedAt,
        lastClickedAt: clickedAt,
      }),
    );
  }

  async list(_limit: number): Promise<UrlStatsItem[]> {
    return [];
  }
}

class SequenceGenerator implements ShortCodeGenerator {
  private cursor = 0;

  constructor(private readonly values: string[]) {}

  generate(): string {
    const next = this.values[this.cursor];
    this.cursor += 1;
    return next;
  }
}

describe("CreateShortUrlUseCase", () => {
  it("retries when short code collides", async () => {
    const repository = new InMemoryRepository();
    const generator = new SequenceGenerator(["AAAAAA", "BBBBBB"]);

    await repository.create({
      shortCode: "AAAAAA",
      originalUrl: "https://example.com",
    });

    const useCase = new CreateShortUrlUseCase(repository, generator);
    const result = await useCase.execute({
      originalUrl: "https://github.com",
    });

    expect(result.shortCode).toBe("BBBBBB");
  });

  it("fails on invalid url", async () => {
    const repository = new InMemoryRepository();
    const generator = new SequenceGenerator(["CCCCCC"]);
    const useCase = new CreateShortUrlUseCase(repository, generator);

    await expect(
      useCase.execute({
        originalUrl: "invalid-url",
      }),
    ).rejects.toThrow("Please provide a valid URL.");
  });
});
