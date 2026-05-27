import type { ShortCode } from "../domain/short-code";
import type { ShortUrl } from "../domain/short-url";

export interface ShortUrlRepository {
  findByCode(code: ShortCode): Promise<ShortUrl | null>;
  findAll(): Promise<ShortUrl[]>;
  save(shortUrl: ShortUrl): Promise<void>;
  incrementClicks(code: ShortCode): Promise<void>;
}
