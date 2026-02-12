/**
 * URL Service Layer
 *
 * Business logic for URL shortening operations.
 * Acts as a bridge between route handlers (presentation) and Prisma (data access).
 *
 * This layer:
 * - Encapsulates business rules
 * - Orchestrates domain logic
 * - Manages database transactions
 * - Provides a clean API for route handlers
 */

import { prisma, Prisma } from "@url-shortener/db";
import {
  validateUrl,
  createShortCodeGenerator,
  generateUniqueShortCode,
  type ShortenedUrlData,
  type ShortenedUrlWithStats,
} from "@url-shortener/engine";

const shortCodeGenerator = createShortCodeGenerator();

/**
 * Service for URL shortening operations
 */
export class UrlService {
  /**
   * Create a shortened URL
   *
   * Process:
   * 1. Validate the input URL
   * 2. Check if URL already exists (avoid duplicates)
   * 3. Generate a unique short code with collision detection
   * 4. Persist to database
   *
   * @param originalUrl - The URL to shorten
   * @returns The created shortened URL data
   * @throws ValidationError if URL is invalid
   */
  async createShortenedUrl(originalUrl: string): Promise<ShortenedUrlData> {
    // Validate input
    const validatedUrl = validateUrl(originalUrl);

    // Check if URL already exists (optional: return existing instead of creating duplicate)
    const existing = await prisma.shortenedUrl.findFirst({
      where: { originalUrl: validatedUrl },
    });

    if (existing) {
      return existing;
    }

    // Generate unique short code with collision handling
    const shortCode = await generateUniqueShortCode(
      shortCodeGenerator,
      async (code) => {
        const exists = await prisma.shortenedUrl.findUnique({
          where: { shortCode: code },
        });
        return exists !== null;
      },
    );

    // Save to database
    const shortened = await prisma.shortenedUrl.create({
      data: {
        shortCode,
        originalUrl: validatedUrl,
      },
    });

    return shortened;
  }

  /**
   * Resolve a short code to its original URL
   *
   * @param shortCode - The short code to resolve
   * @returns The original URL, or null if not found
   */
  async resolveShortCode(shortCode: string): Promise<string | null> {
    const shortened = await prisma.shortenedUrl.findUnique({
      where: { shortCode },
    });

    return shortened?.originalUrl ?? null;
  }

  /**
   * Record a click event for analytics
   *
   * Uses a transaction to ensure atomic updates:
   * - Increment click count
   * - Create click event record
   *
   * Fails silently if short code doesn't exist (defensive programming).
   *
   * @param shortCode - The short code that was accessed
   * @param userAgent - User agent string from request
   * @param referer - Referer header from request
   */
  async recordClick(
    shortCode: string,
    userAgent?: string,
    referer?: string,
  ): Promise<void> {
    const shortened = await prisma.shortenedUrl.findUnique({
      where: { shortCode },
    });

    if (!shortened) {
      return; // Silently fail for invalid codes
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction([
      // Increment click count
      prisma.shortenedUrl.update({
        where: { id: shortened.id },
        data: { clickCount: { increment: 1 } },
      }),

      // Record click event for detailed analytics
      prisma.click.create({
        data: {
          shortenedUrlId: shortened.id,
          userAgent: userAgent?.substring(0, 255), // Limit length to prevent large data
          referer: referer?.substring(0, 255),
        },
      }),
    ]);
  }

  /**
   * Get all shortened URLs with statistics
   *
   * Returns URLs ordered by creation date (newest first).
   * Includes recent click events for each URL.
   *
   * @returns Array of shortened URLs with their statistics
   */
  async getAllUrls(): Promise<ShortenedUrlWithStats[]> {
    const urls = await prisma.shortenedUrl.findMany({
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
          take: 10, // Recent 10 clicks per URL
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return urls.map((url: Prisma.ShortenedUrlGetPayload<{ include: { clicks: true } }>) => ({
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
      recentClicks: url.clicks.map((click) => ({
        id: click.id,
        shortenedUrlId: click.shortenedUrlId,
        timestamp: click.timestamp,
        userAgent: click.userAgent ?? undefined,
        referer: click.referer ?? undefined,
      })),
    }));
  }

  /**
   * Get detailed statistics for a specific short code
   *
   * @param shortCode - The short code to get stats for
   * @returns URL data with click history, or null if not found
   */
  async getUrlStats(shortCode: string): Promise<ShortenedUrlWithStats | null> {
    const url = await prisma.shortenedUrl.findUnique({
      where: { shortCode },
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
          take: 50, // More detailed history for individual URL view
        },
      },
    });

    if (!url) {
      return null;
    }

    return {
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url.clickCount,
      recentClicks: url.clicks.map((click) => ({
        id: click.id,
        shortenedUrlId: click.shortenedUrlId,
        timestamp: click.timestamp,
        userAgent: click.userAgent ?? undefined,
        referer: click.referer ?? undefined,
      })),
    };
  }

}

/**
 * Singleton instance of UrlService
 * Reused across all requests for efficiency
 */
export const urlService = new UrlService();
