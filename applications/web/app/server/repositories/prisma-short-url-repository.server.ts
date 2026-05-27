import {
  createOriginalUrl,
  createShortCode,
  type ShortCode,
  type ShortUrl,
  type ShortUrlRepository,
} from "@url-shortener/engine";
import type { PrismaClient } from "~/generated/prisma/client";

export class PrismaShortUrlRepository implements ShortUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCode(code: ShortCode): Promise<ShortUrl | null> {
    const shortUrl = await this.prisma.shortUrl.findUnique({
      where: { code },
    });

    return shortUrl ? mapToDomain(shortUrl) : null;
  }

  async findAll(): Promise<ShortUrl[]> {
    const shortUrls = await this.prisma.shortUrl.findMany({
      orderBy: { createdAt: "desc" },
    });

    return shortUrls.map(mapToDomain);
  }

  async save(shortUrl: ShortUrl): Promise<void> {
    await this.prisma.shortUrl.create({
      data: {
        code: shortUrl.code,
        originalUrl: shortUrl.originalUrl,
        clickCount: shortUrl.clickCount,
        createdAt: shortUrl.createdAt,
        updatedAt: shortUrl.updatedAt,
      },
    });
  }

  async incrementClicks(code: ShortCode): Promise<void> {
    await this.prisma.shortUrl.update({
      where: { code },
      data: {
        clickCount: { increment: 1 },
      },
    });
  }
}

type PrismaShortUrl = Awaited<
  ReturnType<PrismaClient["shortUrl"]["findUnique"]>
>;

function mapToDomain(shortUrl: NonNullable<PrismaShortUrl>): ShortUrl {
  return {
    code: createShortCode(shortUrl.code),
    originalUrl: createOriginalUrl(shortUrl.originalUrl),
    clickCount: shortUrl.clickCount,
    createdAt: shortUrl.createdAt,
    updatedAt: shortUrl.updatedAt,
  };
}
