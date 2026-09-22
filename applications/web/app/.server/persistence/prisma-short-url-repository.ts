import {
  ShortCodeTakenError,
  type NewShortUrl,
  type ShortUrl,
  type ShortUrlRepository,
} from "@url-shortener/engine";
import { Prisma, type PrismaClient } from "../../../generated/prisma/client";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

export class PrismaShortUrlRepository implements ShortUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: NewShortUrl): Promise<ShortUrl> {
    try {
      return await this.prisma.shortUrl.create({ data });
    } catch (error) {
      if (hasPrismaCode(error, UNIQUE_CONSTRAINT_VIOLATION)) {
        throw new ShortCodeTakenError(data.shortCode);
      }
      throw error;
    }
  }

  findByCode(shortCode: string): Promise<ShortUrl | null> {
    return this.prisma.shortUrl.findUnique({ where: { shortCode } });
  }

  async recordClick(shortCode: string, at: Date): Promise<void> {
    // In-database increment so concurrent clicks are never lost; updateMany is a no-op for a missing row instead of throwing.
    await this.prisma.shortUrl.updateMany({
      where: { shortCode },
      data: { clicks: { increment: 1 }, lastClickedAt: at },
    });
  }

  listNewestFirst(): Promise<ShortUrl[]> {
    return this.prisma.shortUrl.findMany({ orderBy: { createdAt: "desc" } });
  }
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
  );
}
