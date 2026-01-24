import type { RecordClickOptions } from "@url-shortener/core";

export interface ShortenedUrlResult {
  shortCode: string;
  shortenedUrl: string;
  originalUrl: string;
  clicks: number;
}

export interface CreateUrlOptions {
  ipHash?: string;
  userAgentHash?: string;
}

export interface UrlShortenerService {
  getBaseUrl(): string;
  shortenUrl(url: string, options?: CreateUrlOptions): Promise<ShortenedUrlResult>;
  findExistingUrl(originalUrl: string): Promise<ShortenedUrlResult | null>;
  getOriginalUrl(code: string): Promise<string | null>;
  getAllUrls(): Promise<ShortenedUrlResult[]>;
  trackClick(code: string, options?: RecordClickOptions): Promise<void>;
}
