import type { UrlRepository } from "@url-shortener/engine";
import { ShortenedUrl, ShortCode, OriginalUrl } from "@url-shortener/engine";
import { prisma } from "./prisma-client";

type PrismaRecord = { id: string; shortCode: string; originalUrl: string; clicks: number; createdAt: Date };

function toEntity(r: PrismaRecord): ShortenedUrl {
  return new ShortenedUrl(
    r.id,
    ShortCode.from(r.shortCode),
    OriginalUrl.fromStorage(r.originalUrl),
    r.clicks,
    r.createdAt,
  );
}

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

  async incrementClicks(code: string): Promise<ShortenedUrl | null> {
    try {
      const record = await prisma.shortenedUrl.update({
        where: { shortCode: code },
        data: { clicks: { increment: 1 } },
      });
      return toEntity(record);
    } catch (err: unknown) {
      // P2025 = record not found
      if (err instanceof Error && (err as { code?: string }).code === "P2025") return null;
      throw err;
    }
  }

  async findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findUnique({ where: { originalUrl } });
    return record ? toEntity(record) : null;
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findUnique({ where: { shortCode: code } });
    return record ? toEntity(record) : null;
  }

  async findAll(): Promise<ShortenedUrl[]> {
    const records = await prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
    });
    return records.map(toEntity);
  }
}
