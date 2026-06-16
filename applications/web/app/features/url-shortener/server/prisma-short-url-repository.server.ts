import type { PrismaClient } from "@prisma/client";
import {
  DuplicateShortCodeError,
  type RepositoryCreateShortUrlInput,
  type ShortUrlRepository,
  type UrlStatsItem,
} from "@url-shortener/engine";
import { ShortUrl } from "@url-shortener/engine";
import { OriginalUrl } from "@url-shortener/engine";
import { ShortCode } from "@url-shortener/engine";

export class PrismaShortUrlRepository implements ShortUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: RepositoryCreateShortUrlInput): Promise<ShortUrl> {
    try {
      const row = await this.prisma.shortUrl.create({
        data: {
          shortCode: input.shortCode,
          originalUrl: input.originalUrl,
        },
      });

      return new ShortUrl({
        id: row.id,
        shortCode: ShortCode.create(row.shortCode),
        originalUrl: OriginalUrl.create(row.originalUrl),
        clickCount: row.clickCount,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        lastClickedAt: row.lastClickedAt,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new DuplicateShortCodeError();
      }

      throw error;
    }
  }

  async findByCode(shortCode: string): Promise<ShortUrl | null> {
    const row = await this.prisma.shortUrl.findUnique({
      where: { shortCode },
    });

    if (!row) {
      return null;
    }

    return new ShortUrl({
      id: row.id,
      shortCode: ShortCode.create(row.shortCode),
      originalUrl: OriginalUrl.create(row.originalUrl),
      clickCount: row.clickCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastClickedAt: row.lastClickedAt,
    });
  }

  async existsByCode(shortCode: string): Promise<boolean> {
    const count = await this.prisma.shortUrl.count({
      where: { shortCode },
      take: 1,
    });

    return count > 0;
  }

  async incrementClickCount(shortCode: string, clickedAt: Date): Promise<void> {
    await this.prisma.shortUrl.update({
      where: { shortCode },
      data: {
        clickCount: { increment: 1 },
        lastClickedAt: clickedAt,
      },
    });
  }

  async list(limit: number): Promise<UrlStatsItem[]> {
    const rows = await this.prisma.shortUrl.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        shortCode: true,
        originalUrl: true,
        clickCount: true,
        createdAt: true,
        lastClickedAt: true,
      },
    });

    return rows;
  }
}
