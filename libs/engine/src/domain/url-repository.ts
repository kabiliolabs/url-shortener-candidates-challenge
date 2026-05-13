import { ShortenedUrl } from "./shortened-url";

export interface UrlRepository {
  save(url: ShortenedUrl): Promise<void>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  incrementClicks(code: string): Promise<void>;
  findAll(): Promise<ShortenedUrl[]>;
}
