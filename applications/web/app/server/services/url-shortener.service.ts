import {
  ShortenedUrl,
  generateShortCode,
  type RecordClickOptions,
  sqliteUrlRepository,
} from "@url-shortener/core";
import { handleDatabaseError } from "../errors";
import type {
  ShortenedUrlResult,
  CreateUrlOptions,
  UrlShortenerService,
} from "./types";

// Configuration
const baseUrl = process.env.PUBLIC_URL;

// Repository instance - SQLite only
const urlRepository = sqliteUrlRepository;

console.log(`[url-shortener] Using SQLite repository`);

export const urlShortenerService: UrlShortenerService = {
  getBaseUrl(): string {
    return baseUrl ? `${baseUrl}/s/` : "-";
  },

  // Finds and checks if there is an existing URL
  async findExistingUrl(originalUrl: string): Promise<ShortenedUrlResult | null> {
    try {
      const existing = await urlRepository.findByOriginalUrl(originalUrl);
      if (!existing) return null;

      return {
        shortCode: existing.shortCode,
        shortenedUrl: `${baseUrl}/s/${existing.shortCode}`,
        originalUrl: existing.originalUrl,
        clicks: existing.clicks,
      };
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Shortens a URL
  async shortenUrl(url: string, options?: CreateUrlOptions): Promise<ShortenedUrlResult> {
    try {
      // Check for existing URL first
      const existing = await this.findExistingUrl(url);
      if (existing) {
        console.log(`[url-shortener] Returning existing short URL for: ${url}`);
        return existing;
      }

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
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Gets the original URL from the short code
  async getOriginalUrl(code: string): Promise<string | null> {
    try {
      const shortenedUrl = await urlRepository.findByCode(code);
      return shortenedUrl?.originalUrl ?? null;
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Gets all the URLs
  async getAllUrls(): Promise<ShortenedUrlResult[]> {
    try {
      const urls = await urlRepository.findAll();
      return urls.map((url) => ({
        shortCode: url.shortCode,
        shortenedUrl: `${baseUrl}/s/${url.shortCode}`,
        originalUrl: url.originalUrl,
        clicks: url.clicks,
      }));
    } catch (error) {
      handleDatabaseError(error);
    }
  },

  // Tracks the click
  async trackClick(code: string, options?: RecordClickOptions): Promise<void> {
    try {
      await urlRepository.recordClick(code, options);
    } catch (error) {
      handleDatabaseError(error);
    }
  },
};
