import type { IUrlRepository, UrlSummary } from "../../domain/repositories/url-repository";
import type { ShortCode } from "../../domain/value-objects/short-code";
import type { ShortenedUrl } from "../../domain/entities/shortened-url";

export class InMemoryUrlRepository implements IUrlRepository {
  private readonly store = new Map<string, ShortenedUrl>();
  private readonly clicks = new Map<string, number>();
  private readonly createdAt = new Map<string, Date>();

  async save(entry: ShortenedUrl): Promise<void> {
    const key = entry.shortCode.value;
    if (!this.createdAt.has(key)) {
      this.createdAt.set(key, new Date());
      this.clicks.set(key, 0);
    }
    this.store.set(key, entry);
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    return this.store.get(code.value) ?? null;
  }

  async existsByCode(code: ShortCode): Promise<boolean> {
    return this.store.has(code.value);
  }

  async findAll(): Promise<UrlSummary[]> {
    return [...this.store.entries()]
      .map(([key, entry]) => ({
        code: key,
        url: entry.longUrl.value,
        clicks: this.clicks.get(key) ?? 0,
        createdAt: this.createdAt.get(key) ?? new Date(),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async incrementClicks(code: ShortCode): Promise<void> {
    const key = code.value;
    this.clicks.set(key, (this.clicks.get(key) ?? 0) + 1);
  }
}
