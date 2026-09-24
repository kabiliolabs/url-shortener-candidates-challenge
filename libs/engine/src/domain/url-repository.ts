import type { ShortUrl } from "./short-url";

export interface UrlRepository {
  /** Must throw CodeAlreadyExistsError if the code is taken (unique constraint). */
  create(input: { code: string; originalUrl: string }): Promise<ShortUrl>;
  findByCode(code: string): Promise<ShortUrl | null>;
  /** Atomically increments the click counter. Returns null if the code doesn't exist. */
  registerClick(code: string): Promise<ShortUrl | null>;
  list(): Promise<ShortUrl[]>;
}