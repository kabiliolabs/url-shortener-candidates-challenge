import type { ShortCode } from "./short-code";
import type { ShortUrl } from "./short-url";

export interface ListOptions {
  offset: number;
  limit: number;
}

export interface ListResult {
  items: ShortUrl[];
  total: number;
}

/** Port for short URL persistence. Implemented in libs/infrastructure. */
export interface ShortUrlRepository {
  /** Stores a new short URL. Throws ShortCodeAlreadyExistsError if the code is taken. */
  save(shortUrl: ShortUrl): Promise<void>;

  /**
   * Atomically adds one click and sets lastClickedAt.
   * Returns the updated short URL, or null if the code doesn't exist.
   */
  registerClick(code: ShortCode, at: Date): Promise<ShortUrl | null>;

  /** Newest first. */
  list(options: ListOptions): Promise<ListResult>;
}
