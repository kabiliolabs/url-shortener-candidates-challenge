import {
  ShortenedUrl,
  generateShortCode,
  type RecordClickOptions,
  sqliteUrlRepository,
} from "@url-shortener/core";

// Configuration
const baseUrl = process.env.PUBLIC_URL;

// Custom error for database issues
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Helper to check if error is a Prisma database error
function isDatabaseError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("table") && message.includes("does not exist") ||
      message.includes("database") ||
      message.includes("prisma") ||
      error.name === "PrismaClientKnownRequestError" ||
      error.name === "PrismaClientInitializationError"
    );
  }
  return false;
}

// Wrapper to handle database errors gracefully
function handleDatabaseError(error: unknown): never {
  if (isDatabaseError(error)) {
    throw new DatabaseError(
      "Database is not set up correctly. Please run 'pnpm db:push' to initialize the database.",
      error instanceof Error ? error : undefined
    );
  }
  throw error;
}

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
  findExistingUrl(originalUrl: string): Promise<ShortenedUrlResult | null>;
  getOriginalUrl(code: string): Promise<string | null>;
  getAllUrls(): Promise<ShortenedUrlResult[]>;
  trackClick(code: string, options?: RecordClickOptions): Promise<void>;
}

export const urlShortenerService: UrlShortenerService = {
  getBaseUrl(): string {
    return baseUrl ? `${baseUrl}/s/` : "-";
  },

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

  async getOriginalUrl(code: string): Promise<string | null> {
    try {
      const shortenedUrl = await urlRepository.findByCode(code);
      return shortenedUrl?.originalUrl ?? null;
    } catch (error) {
      handleDatabaseError(error);
    }
  },

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

  async trackClick(code: string, options?: RecordClickOptions): Promise<void> {
    try {
      await urlRepository.recordClick(code, options);
    } catch (error) {
      handleDatabaseError(error);
    }
  },
};
