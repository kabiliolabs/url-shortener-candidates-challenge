import type { ShortUrl } from "./short-url";

export interface ShortUrlRepository {
  /**
   * Rejects with ShortCodeAlreadyExists when the code is taken. There is no
   * `exists(code)` on purpose: a lookup followed by an insert would let two
   * concurrent requests claim the same code.
   */
  create(code: string, originalUrl: string): Promise<ShortUrl>;

  /**
   * Counts one click and returns the updated short URL, or null when the code
   * is unknown. Lookup and increment are one operation so that concurrent
   * clicks are never lost.
   */
  registerClick(code: string): Promise<ShortUrl | null>;

  /** Newest first. */
  list(limit: number): Promise<ShortUrl[]>;
}
