import { Prisma, type PrismaClient, type ShortUrl as ShortUrlRecord } from "@prisma/client";
import { DuplicateCodeError } from "../domain/errors";
import { ShortUrl } from "../domain/short-url";
import type { PageRequest, UrlRepository } from "../domain/url-repository";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function isRecordNotFoundError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

function toDomain(record: ShortUrlRecord): ShortUrl {
  return new ShortUrl({
    code: record.code,
    originalUrl: record.originalUrl,
    createdAt: record.createdAt,
    clickCount: record.clicks,
  });
}

export class PrismaUrlRepository implements UrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(shortUrl: ShortUrl): Promise<void> {
    const { count } = await this.prisma.shortUrl.updateMany({
      where: { code: shortUrl.code, originalUrl: shortUrl.originalUrl },
      data: { clicks: shortUrl.clickCount },
    });

    if (count > 0) {
      return;
    }

    try {
      await this.prisma.shortUrl.create({
        data: {
          code: shortUrl.code,
          originalUrl: shortUrl.originalUrl,
          clicks: shortUrl.clickCount,
          createdAt: shortUrl.createdAt,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DuplicateCodeError(shortUrl.code);
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortUrl | null> {
    const record = await this.prisma.shortUrl.findUnique({ where: { code } });
    return record ? toDomain(record) : null;
  }

  async exists(code: string): Promise<boolean> {
    const count = await this.prisma.shortUrl.count({ where: { code } });
    return count > 0;
  }

  async incrementClicks(code: string): Promise<ShortUrl | null> {
    try {
      // Compiles to `SET clicks = clicks + 1`, so concurrent resolutions can't lose updates.
      const record = await this.prisma.shortUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
      return toDomain(record);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        return null;
      }
      throw error;
    }
  }

  async list({ limit, offset }: PageRequest): Promise<ShortUrl[]> {
    const records = await this.prisma.shortUrl.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: offset,
    });
    return records.map(toDomain);
  }
}
