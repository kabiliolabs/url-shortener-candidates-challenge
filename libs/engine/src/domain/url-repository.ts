import type { ShortUrl } from "./short-url";

export interface PageRequest {
  limit: number;
  offset: number;
}

export interface UrlRepository {
  save(shortUrl: ShortUrl): Promise<void>;
  findByCode(code: string): Promise<ShortUrl | null>;
  exists(code: string): Promise<boolean>;
  /** Atomically increments the click count; returns the updated ShortUrl, or null if the code is unknown. */
  incrementClicks(code: string): Promise<ShortUrl | null>;
  /** Newest first. */
  list(page: PageRequest): Promise<ShortUrl[]>;
}
