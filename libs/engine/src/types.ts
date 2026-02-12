/**
 * Type Definitions for URL Shortener Domain
 * 
 * Provides type-safe interfaces for data structures across the application.
 */

/**
 * Shortened URL data structure
 * Represents a URL mapping with metadata
 */
export interface ShortenedUrlData {
  id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
}

/**
 * Click event data structure
 * Represents a single click/access event for analytics
 */
export interface ClickData {
  id: string;
  shortenedUrlId: string;
  timestamp: Date;
  userAgent?: string;
  referer?: string;
}

/**
 * Input for creating a shortened URL
 */
export interface CreateShortenedUrlInput {
  originalUrl: string;
}

/**
 * Shortened URL with detailed statistics
 * Includes click history for analytics display
 */
export interface ShortenedUrlWithStats extends ShortenedUrlData {
  recentClicks: ClickData[];
}

/**
 * Result of a URL shortening operation
 */
export interface CreateShortenedUrlResult {
  shortCode: string;
  originalUrl: string;
  shortenedUrl: string;
}
