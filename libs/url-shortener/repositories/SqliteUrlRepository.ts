import { PrismaClient } from "@prisma/client";
import { ShortenedUrl, UrlClick } from "../models";
import type { UrlRepository, RecordClickOptions } from "./UrlRepository";
import { getPrismaClient } from "./prisma";

// SqliteUrlRepository implements the UrlRepository interface
export class SqliteUrlRepository implements UrlRepository {
  constructor(private prisma: PrismaClient) {}

  async save(shortenedUrl: ShortenedUrl): Promise<ShortenedUrl> {
    console.log(`[SqliteUrlRepository] Saving URL: ${shortenedUrl.shortCode} -> ${shortenedUrl.originalUrl}`);

    const created = await this.prisma.shortUrl.create({
      data: {
        code: shortenedUrl.shortCode,
        originalUrl: shortenedUrl.originalUrl,
        createdByIpHash: shortenedUrl.createdByIpHash,
        createdByUserAgentHash: shortenedUrl.createdByUserAgentHash,
      },
    });

    console.log(`[SqliteUrlRepository] Saved successfully: id=${created.id}, code=${created.code}`);

    return new ShortenedUrl({
      id: created.id,
      shortCode: created.code,
      originalUrl: created.originalUrl,
      createdAt: created.createdAt,
      createdByIpHash: created.createdByIpHash,
      createdByUserAgentHash: created.createdByUserAgentHash,
      clicks: 0,
    });
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    console.log(`[SqliteUrlRepository] Finding URL by code: ${code}`);

    const record = await this.prisma.shortUrl.findUnique({
      where: { code },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    if (!record) {
      console.log(`[SqliteUrlRepository] URL not found for code: ${code}`);
      return null;
    }

    console.log(`[SqliteUrlRepository] Found URL: ${code} -> ${record.originalUrl} (${record._count.clicks} clicks)`);

    return new ShortenedUrl({
      id: record.id,
      shortCode: record.code,
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      createdByIpHash: record.createdByIpHash,
      createdByUserAgentHash: record.createdByUserAgentHash,
      clicks: record._count.clicks,
    });
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null> {
    console.log(`[SqliteUrlRepository] Finding URL by originalUrl: ${originalUrl}`);

    const record = await this.prisma.shortUrl.findFirst({
      where: { originalUrl },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    if (!record) {
      console.log(`[SqliteUrlRepository] No existing short URL found for: ${originalUrl}`);
      return null;
    }

    console.log(`[SqliteUrlRepository] Found existing short URL: ${record.code} for ${originalUrl}`);

    return new ShortenedUrl({
      id: record.id,
      shortCode: record.code,
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      createdByIpHash: record.createdByIpHash,
      createdByUserAgentHash: record.createdByUserAgentHash,
      clicks: record._count.clicks,
    });
  }

  async findAll(): Promise<ShortenedUrl[]> {
    const records = await this.prisma.shortUrl.findMany({
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map(
      (record) =>
        new ShortenedUrl({
          id: record.id,
          shortCode: record.code,
          originalUrl: record.originalUrl,
          createdAt: record.createdAt,
          createdByIpHash: record.createdByIpHash,
          createdByUserAgentHash: record.createdByUserAgentHash,
          clicks: record._count.clicks,
        })
    );
  }

  async recordClick(code: string, options?: RecordClickOptions): Promise<void> {
    console.log(`[SqliteUrlRepository] Recording click for code: ${code}`);

    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!shortUrl) {
      console.error(`[SqliteUrlRepository] Short URL not found: ${code}`);
      throw new Error(`Short URL not found: ${code}`);
    }

    const click = await this.prisma.shortUrlClick.create({
      data: {
        shortUrlId: shortUrl.id,
        ipHash: options?.ipHash,
        userAgentHash: options?.userAgentHash,
      },
    });

    console.log(`[SqliteUrlRepository] Click recorded: id=${click.id}, shortUrlId=${shortUrl.id}`);
  }

  async getClickCount(code: string): Promise<number> {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { code },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
    });

    return shortUrl?._count.clicks ?? 0;
  }

  async getClicks(code: string, limit = 100): Promise<UrlClick[]> {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!shortUrl) return [];

    const clicks = await this.prisma.shortUrlClick.findMany({
      where: { shortUrlId: shortUrl.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return clicks.map(
      (click) =>
        new UrlClick({
          id: click.id,
          shortUrlId: click.shortUrlId,
          createdAt: click.createdAt,
          ipHash: click.ipHash,
          userAgentHash: click.userAgentHash,
        })
    );
  }

  async exists(code: string): Promise<boolean> {
    const count = await this.prisma.shortUrl.count({
      where: { code },
    });
    return count > 0;
  }
}

// Default repository instance
export const sqliteUrlRepository = new SqliteUrlRepository(getPrismaClient());
