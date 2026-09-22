import type { ShortUrl } from "../domain/short-url";

export interface NewShortUrl {
  shortCode: string;
  originalUrl: string;
}

export interface ShortUrlRepository {
  /** @throws ShortCodeTakenError when the short code already exists */
  create(shortUrl: NewShortUrl): Promise<ShortUrl>;
  /** Atomically increments clicks and sets lastClickedAt; null when the code doesn't exist. */
  recordClick(shortCode: string, at: Date): Promise<ShortUrl | null>;
  listNewestFirst(): Promise<ShortUrl[]>;
}
