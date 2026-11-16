import type { OriginalUrl } from "./original-url";
import type { ShortUrl } from "./short-url";

export interface ShortUrlRepository {
  /**
   * Rejects with ShortCodeAlreadyExists when the code is taken. There is no
   * `exists(code)` on purpose: a lookup followed by an insert would let two
   * concurrent requests claim the same code. Taking an OriginalUrl instead of
   * a string means an unvalidated URL cannot be stored.
   */
  create(code: string, originalUrl: OriginalUrl): Promise<ShortUrl>;

  /**
   * Counts one click and returns the updated short URL, or null when the code
   * is unknown. Lookup and increment are one operation so that concurrent
   * clicks are never lost.
   */
  registerClick(code: string): Promise<ShortUrl | null>;

  /** Newest first. */
  list(limit: number): Promise<ShortUrl[]>;
}
