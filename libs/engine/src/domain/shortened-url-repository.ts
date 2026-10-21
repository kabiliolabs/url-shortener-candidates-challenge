import type { DestinationUrl } from "./destination-url";
import type { ShortCode } from "./short-code";
import type { ShortenedUrl } from "./shortened-url";

export interface ShortenedUrlStats {
  totalUrls: number;
  totalClicks: number;
}

/**
 * Outbound port (hexagonal architecture).
 *
 * The domain and the use cases depend on this interface only; the Prisma
 * implementation lives in `applications/web/app/infrastructure` and is injected
 * at the composition root. Swapping SQLite for Postgres, or for an in-memory
 * fake in tests, touches nothing in this library (Dependency Inversion).
 */
export interface ShortenedUrlRepository {
  /**
   * Persists a brand new shortened URL.
   * MUST throw `ShortCodeCollisionError` if the code is already taken — the
   * uniqueness guarantee belongs to the storage engine, not to a prior read,
   * which would be racy.
   */
  save(shortenedUrl: ShortenedUrl): Promise<void>;

  findByCode(code: ShortCode): Promise<ShortenedUrl | null>;

  findByDestination(destination: DestinationUrl): Promise<ShortenedUrl | null>;

  /** Atomically increments the click counter. Returns null if the code is unknown. */
  registerClick(code: ShortCode): Promise<ShortenedUrl | null>;

  listRecent(limit: number): Promise<ShortenedUrl[]>;

  stats(): Promise<ShortenedUrlStats>;
}
