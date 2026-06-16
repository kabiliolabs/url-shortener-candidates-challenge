import { describe, expect, it } from "vitest";
import {
  RedirectToOriginalUrlUseCase,
  TrackClickUseCase,
  type ShortUrlRepository,
  type UrlStatsItem,
  ShortUrl,
  OriginalUrl,
  ShortCode,
} from "../src";

class InMemoryRepository implements ShortUrlRepository {
  private readonly storage = new Map<string, ShortUrl>();

  async create(input: { shortCode: string; originalUrl: string }): Promise<ShortUrl> {
    const now = new Date();
    const row = new ShortUrl({
      id: crypto.randomUUID(),
      shortCode: ShortCode.create(input.shortCode),
      originalUrl: OriginalUrl.create(input.originalUrl),
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
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

describe("redirect and track use cases", () => {
  it("returns target url and tracks clicks", async () => {
    const repository = new InMemoryRepository();
    await repository.create({
      shortCode: "ABC123",
      originalUrl: "https://example.com/docs",
    });

    const redirectUseCase = new RedirectToOriginalUrlUseCase(repository);
    const trackUseCase = new TrackClickUseCase(repository);

    const redirectResult = await redirectUseCase.execute({ shortCode: "ABC123" });
    expect(redirectResult.originalUrl).toBe("https://example.com/docs");

    await trackUseCase.execute({ shortCode: "ABC123", clickedAt: new Date() });

    const updated = await repository.findByCode("ABC123");
    expect(updated?.clickCount).toBe(1);
  });
});
