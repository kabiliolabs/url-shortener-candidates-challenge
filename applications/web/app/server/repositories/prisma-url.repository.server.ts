import { prisma } from "@url-shortener/database";
import type {
  UrlRepository,
  CreateUrlData,
  UrlWithStats,
} from "./url.repository.js";

export class PrismaUrlRepository implements UrlRepository {
  async findByCode(code: string) {
    return prisma.shortenedUrl.findUnique({
      where: { shortCode: code },
    });
  }

  async create(data: CreateUrlData) {
    return prisma.shortenedUrl.create({
      data: {
        shortCode: data.shortCode,
        originalUrl: data.originalUrl,
      },
    });
  }

  async findAllWithStats(): Promise<UrlWithStats[]> {
    const urls = await prisma.shortenedUrl.findMany({
      include: { _count: { select: { clicks: true } } },
      orderBy: { createdAt: "desc" },
    });
    return urls.map((url) => ({
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url._count.clicks,
    }));
  }

  async findByCodeWithStats(code: string): Promise<UrlWithStats | null> {
    const url = await prisma.shortenedUrl.findUnique({
      where: { shortCode: code },
      include: { _count: { select: { clicks: true } } },
    });
    if (!url) return null;
    return {
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
      clickCount: url._count.clicks,
    };
  }
}
