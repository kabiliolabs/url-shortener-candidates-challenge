import type { ShortUrl } from "../domain/short-url";

export interface NewShortUrl {
  shortCode: string;
  originalUrl: string;
}

export interface ShortUrlRepository {
  /** @throws ShortCodeTakenError when the short code already exists */
  create(shortUrl: NewShortUrl): Promise<ShortUrl>;
  findByCode(shortCode: string): Promise<ShortUrl | null>;
  /** Atomically increments clicks and sets lastClickedAt; does nothing when the code doesn't exist. */
  recordClick(shortCode: string, at: Date): Promise<void>;
  listNewestFirst(): Promise<ShortUrl[]>;
}
