import {
  ShortenedUrl,
  generateShortCode,
  type RecordClickOptions,
  sqliteUrlRepository,
} from "@url-shortener/core";

// Configuration
const baseUrl = process.env.PUBLIC_URL;

// Repository instance - SQLite only
const urlRepository = sqliteUrlRepository;

console.log(`[url-shortener] Using SQLite repository`);

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
  getOriginalUrl(code: string): Promise<string | null>;
  getAllUrls(): Promise<ShortenedUrlResult[]>;
  trackClick(code: string, options?: RecordClickOptions): Promise<void>;
}

export const urlShortenerService: UrlShortenerService = {
  getBaseUrl(): string {
    return baseUrl ? `${baseUrl}/s/` : "-";
  },

  async shortenUrl(url: string, options?: CreateUrlOptions): Promise<ShortenedUrlResult> {
    const shortCode = generateShortCode();
    const shortenedUrl = new ShortenedUrl({
      shortCode,
      originalUrl: url,
      createdByIpHash: options?.ipHash,
      createdByUserAgentHash: options?.userAgentHash,
    });

    const saved = await urlRepository.save(shortenedUrl);

    return {
      shortCode: saved.shortCode,
      shortenedUrl: `${baseUrl}/s/${saved.shortCode}`,
      originalUrl: saved.originalUrl,
      clicks: saved.clicks,
    };
  },

  async getOriginalUrl(code: string): Promise<string | null> {
    const shortenedUrl = await urlRepository.findByCode(code);
    return shortenedUrl?.originalUrl ?? null;
  },

  async getAllUrls(): Promise<ShortenedUrlResult[]> {
    const urls = await urlRepository.findAll();
    return urls.map((url) => ({
      shortCode: url.shortCode,
      shortenedUrl: `${baseUrl}/s/${url.shortCode}`,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
    }));
  },

  async trackClick(code: string, options?: RecordClickOptions): Promise<void> {
    await urlRepository.recordClick(code, options);
  },
};
