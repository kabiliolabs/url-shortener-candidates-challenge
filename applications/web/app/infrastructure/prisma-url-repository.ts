import type { UrlRepository } from "@url-shortener/engine";
import { ShortenedUrl, ShortCode, OriginalUrl } from "@url-shortener/engine";
import { prisma } from "./prisma-client";

export class PrismaUrlRepository implements UrlRepository {
  async save(url: ShortenedUrl): Promise<void> {
    await prisma.shortenedUrl.create({
      data: {
        id: url.id,
        shortCode: url.shortCode.value,
        originalUrl: url.originalUrl.value,
        clicks: url.clicks,
        createdAt: url.createdAt,
      },
    });
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findFirst({
      where: { originalUrl },
    });

    if (!record) return null;

    return new ShortenedUrl(
      record.id,
      ShortCode.from(record.shortCode),
      OriginalUrl.fromStorage(record.originalUrl),
      record.clicks,
      record.createdAt
    );
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findUnique({
      where: { shortCode: code },
    });

    if (!record) return null;

    return new ShortenedUrl(
      record.id,
      ShortCode.from(record.shortCode),
      OriginalUrl.fromStorage(record.originalUrl),
      record.clicks,
      record.createdAt
    );
  }

  async update(url: ShortenedUrl): Promise<void> {
    await prisma.shortenedUrl.update({
      where: { shortCode: url.shortCode.value },
      data: { clicks: url.clicks },
    });
  }

  async findAll(): Promise<ShortenedUrl[]> {
    const records = await prisma.shortenedUrl.findMany();

    return records.map((r) =>
      new ShortenedUrl(
        r.id,
        ShortCode.from(r.shortCode),
        OriginalUrl.fromStorage(r.originalUrl),
        r.clicks,
        r.createdAt
      )
    );
  }
}
