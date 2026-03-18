import { ShortCode, LongUrl, ShortenedUrl } from "@url-shortener/engine";
import type { IUrlRepository } from "@url-shortener/engine";
import { prisma } from "../prisma";

export class PrismaUrlRepository implements IUrlRepository {
  async save(entry: ShortenedUrl): Promise<void> {
    await prisma.shortenedUrl.upsert({
      where: { code: entry.shortCode.value },
      create: { code: entry.shortCode.value, url: entry.longUrl.value },
      update: { url: entry.longUrl.value },
    });
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findUnique({
      where: { code: code.value },
    });
    if (!record) return null;
    return new ShortenedUrl(new ShortCode(record.code), new LongUrl(record.url));
  }

  async existsByCode(code: ShortCode): Promise<boolean> {
    const count = await prisma.shortenedUrl.count({ where: { code: code.value } });
    return count > 0;
  }
}
