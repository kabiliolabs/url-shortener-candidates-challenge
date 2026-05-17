import { ShortenedUrl } from "./shortened-url";

export interface UrlRepository {
  save(url: ShortenedUrl): Promise<void>;
  incrementClicks(code: string): Promise<ShortenedUrl | null>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
}
