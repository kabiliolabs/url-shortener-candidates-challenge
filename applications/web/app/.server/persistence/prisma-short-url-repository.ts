import {
  ShortCodeTakenError,
  type NewShortUrl,
  type ShortUrl,
  type ShortUrlRepository,
} from "@url-shortener/engine";
import { Prisma, type PrismaClient } from "../../../generated/prisma/client";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";
const RECORD_NOT_FOUND = "P2025";

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

  async recordClick(shortCode: string, at: Date): Promise<ShortUrl | null> {
    try {
      // A single UPDATE with an in-database increment, so concurrent clicks are never lost.
      return await this.prisma.shortUrl.update({
        where: { shortCode },
        data: { clicks: { increment: 1 }, lastClickedAt: at },
      });
    } catch (error) {
      if (hasPrismaCode(error, RECORD_NOT_FOUND)) return null;
      throw error;
    }
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
