import { Prisma, type PrismaClient, type ShortUrl as ShortUrlRow } from "@prisma/client";
import {
  OriginalUrl,
  ShortCode,
  ShortCodeAlreadyExistsError,
  ShortUrl,
  type ListOptions,
  type ListResult,
  type ShortUrlRepository,
} from "@url-shortener/engine";

// Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
const UNIQUE_CONSTRAINT_FAILED = "P2002";
const RECORD_NOT_FOUND = "P2025";

function isPrismaError(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
}

/** Postgres implementation of the ShortUrlRepository port (SPEC-006). */
export class PrismaShortUrlRepository implements ShortUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(shortUrl: ShortUrl): Promise<void> {
    try {
      await this.prisma.shortUrl.create({
        data: {
          code: shortUrl.code.value,
          originalUrl: shortUrl.originalUrl.value,
          clicks: shortUrl.clicks,
          createdAt: shortUrl.createdAt,
          lastClickedAt: shortUrl.lastClickedAt,
        },
      });
    } catch (error) {
      // Translate the DB error into the domain one, so the use case can retry with a new code.
      if (isPrismaError(error, UNIQUE_CONSTRAINT_FAILED)) {
        throw new ShortCodeAlreadyExistsError(shortUrl.code.value);
      }
      throw error;
    }
  }

  async registerClick(code: ShortCode, at: Date): Promise<ShortUrl | null> {
    try {
      // `increment` becomes `SET clicks = clicks + 1`, so concurrent clicks are never lost (ADR-004).
      const row = await this.prisma.shortUrl.update({
        where: { code: code.value },
        data: { clicks: { increment: 1 }, lastClickedAt: at },
      });
      return toDomain(row);
    } catch (error) {
      if (isPrismaError(error, RECORD_NOT_FOUND)) return null;
      throw error;
    }
  }

  async list({ offset, limit }: ListOptions): Promise<ListResult> {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.shortUrl.findMany({ orderBy: { createdAt: "desc" }, skip: offset, take: limit }),
      this.prisma.shortUrl.count(),
    ]);
    return { items: rows.map(toDomain), total };
  }
}

function toDomain(row: ShortUrlRow): ShortUrl {
  return ShortUrl.restore({
    code: ShortCode.create(row.code),
    originalUrl: OriginalUrl.create(row.originalUrl),
    clicks: row.clicks,
    createdAt: row.createdAt,
    lastClickedAt: row.lastClickedAt,
  });
}
