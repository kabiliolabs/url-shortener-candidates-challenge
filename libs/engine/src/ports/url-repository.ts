/** A persisted short URL, as the domain sees it (storage-agnostic). */
export interface ShortenedUrl {
  id: string;
  code: string;
  originalUrl: string;
  createdAt: Date;
}

/** A short URL enriched with click aggregates, for the listing view. */
export interface ShortenedUrlWithStats extends ShortenedUrl {
  /** Total number of recorded clicks. */
  clickCount: number;
  /** Timestamp of the most recent click, or `null` if never clicked. */
  lastClickedAt: Date | null;
}

/** Optional metadata captured at redirect time for each click. */
export interface ClickMeta {
  referer?: string | null;
  userAgent?: string | null;
}

/**
 * Port (in the hexagonal-architecture sense) for persisting and reading short
 * URLs and their click stats. The domain depends on this interface only; the
 * web layer supplies a concrete adapter (e.g. Prisma) and injects it. This is
 * what keeps the engine free of any database or framework dependency.
 */
export interface UrlRepository {
  /**
   * Persists a new short URL.
   *
   * @throws {CodeCollisionError} MUST be thrown when `code` already exists, so
   * the shortener can retry with a different code. Implementations translate
   * their backend's unique-constraint violation into this domain error.
   */
  create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl>;

  /** Looks up a short URL by its code, or `null` if there is none. */
  findByCode(code: string): Promise<ShortenedUrl | null>;

  /** Returns all short URLs with click aggregates, newest first. */
  list(): Promise<ShortenedUrlWithStats[]>;

  /** Records a single click against a short URL identified by its id. */
  recordClick(urlId: string, meta: ClickMeta): Promise<void>;
}
