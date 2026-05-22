import type { LongUrl } from "../long-url";
import type { ShortenedUrl } from "../shortened-url";
import type { ShortCode } from "../short-code";

export interface ListShortenedUrlsCursor {
  createdAt: Date;
  code: string;
}

export interface ListShortenedUrlsOptions {
  limit: number;
  cursor?: ListShortenedUrlsCursor;
}

export interface ListShortenedUrlsResult {
  items: ShortenedUrl[];
  hasMore: boolean;
  nextCursor: ListShortenedUrlsCursor | null;
}

/**
 * Persistence port for ShortenedUrl aggregate.
 *
 * `save` must throw {@link CodeCollisionError} when the code already exists,
 * so the use-case can retry with a freshly generated code.
 */
export interface ShortenedUrlRepository {
  save(code: ShortCode, longUrl: LongUrl): Promise<ShortenedUrl>;
  findByCode(code: ShortCode): Promise<ShortenedUrl | null>;
  findManyByCodes(codes: string[]): Promise<ShortenedUrl[]>;
  incrementClicks(code: ShortCode): Promise<void>;
  list(opts: ListShortenedUrlsOptions): Promise<ListShortenedUrlsResult>;
}
