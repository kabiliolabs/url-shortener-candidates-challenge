import { ShortCodeTakenError } from "../domain/errors";
import type { ShortUrl } from "../domain/short-url";
import type {
  NewShortUrl,
  ShortUrlRepository,
} from "../ports/short-url-repository";

/** Test double for the repository port; production storage is Postgres. */
export class InMemoryShortUrlRepository implements ShortUrlRepository {
  readonly rows = new Map<string, ShortUrl>();
  private tick = 0;

  async create({ shortCode, originalUrl }: NewShortUrl): Promise<ShortUrl> {
    if (this.rows.has(shortCode)) throw new ShortCodeTakenError(shortCode);
    const shortUrl: ShortUrl = {
      shortCode,
      originalUrl,
      clicks: 0,
      // Strictly increasing timestamps keep newest-first ordering deterministic in tests.
      createdAt: new Date(Date.UTC(2026, 0, 1) + this.tick++),
      lastClickedAt: null,
    };
    this.rows.set(shortCode, shortUrl);
    return { ...shortUrl };
  }

  async recordClick(shortCode: string, at: Date): Promise<ShortUrl | null> {
    const shortUrl = this.rows.get(shortCode);
    if (!shortUrl) return null;
    shortUrl.clicks += 1;
    shortUrl.lastClickedAt = at;
    return { ...shortUrl };
  }

  async listNewestFirst(): Promise<ShortUrl[]> {
    return [...this.rows.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((shortUrl) => ({ ...shortUrl }));
  }
}
