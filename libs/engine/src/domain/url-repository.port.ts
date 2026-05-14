import { ShortenedUrl } from "./shortened-url";

export interface UrlRepository {
  save(url: ShortenedUrl): Promise<void>;
  update(url: ShortenedUrl): Promise<void>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
}
