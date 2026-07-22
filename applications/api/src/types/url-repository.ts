import type { ShortenedUrl } from "../models/shortened-url.js";

export interface UrlRepository {
  create(url: ShortenedUrl): Promise<void>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  findAll(limit: number): Promise<ShortenedUrl[]>;
  incrementClicks(code: string): Promise<ShortenedUrl | null>;
}
