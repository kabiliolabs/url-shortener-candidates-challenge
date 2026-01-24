import { ShortenedUrl, UrlClick } from "../models";

export interface RecordClickOptions {
  ipHash?: string | null;
  userAgentHash?: string | null;
}

// URL Repository Interface
export interface UrlRepository {
  save(shortenedUrl: ShortenedUrl): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
  recordClick(code: string, options?: RecordClickOptions): Promise<void>;
  getClickCount(code: string): Promise<number>;
  getClicks(code: string, limit?: number): Promise<UrlClick[]>;
  exists(code: string): Promise<boolean>;
}
