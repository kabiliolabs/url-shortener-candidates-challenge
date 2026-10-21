import type { DestinationUrl } from "../domain/destination-url";
import { ShortCodeCollisionError } from "../domain/errors";
import type { ShortCode } from "../domain/short-code";
import { ShortenedUrl } from "../domain/shortened-url";
import type {
  ShortenedUrlRepository,
  ShortenedUrlStats,
} from "../domain/shortened-url-repository";

/**
 * In-memory implementation of the port, used by the use-case tests.
 *
 * This is the practical payoff of the hexagonal split: the application layer is
 * tested with no database, no Prisma and no container — in milliseconds.
 */
export class InMemoryShortenedUrlRepository implements ShortenedUrlRepository {
  readonly rows = new Map<string, ShortenedUrl>();

  async save(shortenedUrl: ShortenedUrl): Promise<void> {
    if (this.rows.has(shortenedUrl.code.value)) {
      throw new ShortCodeCollisionError(`Code ${shortenedUrl.code.value} already taken.`);
    }
    this.rows.set(shortenedUrl.code.value, shortenedUrl);
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    return this.rows.get(code.value) ?? null;
  }

  async findByDestination(destination: DestinationUrl): Promise<ShortenedUrl | null> {
    for (const row of this.rows.values()) {
      if (row.destination.equals(destination)) return row;
    }
    return null;
  }

  async registerClick(code: ShortCode): Promise<ShortenedUrl | null> {
    const row = this.rows.get(code.value);
    if (!row) return null;
    const updated = new ShortenedUrl(
      row.code,
      row.destination,
      row.clicks + 1,
      row.createdAt,
      new Date(),
    );
    this.rows.set(code.value, updated);
    return updated;
  }

  async listRecent(limit: number): Promise<ShortenedUrl[]> {
    return [...this.rows.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async stats(): Promise<ShortenedUrlStats> {
    const rows = [...this.rows.values()];
    return {
      totalUrls: rows.length,
      totalClicks: rows.reduce((total, row) => total + row.clicks, 0),
    };
  }
}
