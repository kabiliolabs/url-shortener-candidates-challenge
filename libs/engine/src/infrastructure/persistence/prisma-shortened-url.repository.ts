import { CodeCollisionError } from "../../domain/errors";
import { LongUrl } from "../../domain/long-url";
import type { ShortenedUrl } from "../../domain/shortened-url";
import type {
  ListShortenedUrlsOptions,
  ListShortenedUrlsResult,
  ShortenedUrlRepository,
} from "../../domain/ports/shortened-url-repository";
import { ShortCode } from "../../domain/short-code";
import {
  Prisma,
  type PrismaClient,
  type ShortenedUrl as PrismaShortenedUrl,
} from "../../generated/prisma/client";

const PRISMA_UNIQUE_VIOLATION = "P2002";

export class PrismaShortenedUrlRepository implements ShortenedUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(code: ShortCode, longUrl: LongUrl): Promise<ShortenedUrl> {
    try {
      const row = await this.prisma.shortenedUrl.create({
        data: { code: code.value, longUrl: longUrl.value },
      });
      return toDomain(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === PRISMA_UNIQUE_VIOLATION
      ) {
        throw new CodeCollisionError(code.value);
      }
      throw err;
    }
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    const row = await this.prisma.shortenedUrl.findUnique({
      where: { code: code.value },
    });
    return row ? toDomain(row) : null;
  }

  async findManyByCodes(codes: string[]): Promise<ShortenedUrl[]> {
    if (codes.length === 0) return [];
    const rows = await this.prisma.shortenedUrl.findMany({
      where: { code: { in: codes } },
    });
    return rows.map(toDomain);
  }

  async incrementClicks(code: ShortCode): Promise<void> {
    try {
      await this.prisma.shortenedUrl.update({
        where: { code: code.value },
        data: {
          clickCount: { increment: 1 },
          lastClickedAt: new Date(),
        },
      });
    } catch (err) {
      // Row could vanish between read and write (admin delete). Swallow
      // P2025 "record not found" so the click path stays resilient.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
        return;
      }
      throw err;
    }
  }

  // Keyset pagination on (createdAt DESC, code DESC). Avoids the O(N) cost
  // of OFFSET on a billion-row partitioned table; each page is a bounded
  // index range scan with no COUNT(*).
  async list(opts: ListShortenedUrlsOptions): Promise<ListShortenedUrlsResult> {
    const where = opts.cursor
      ? {
          OR: [
            { createdAt: { lt: opts.cursor.createdAt } },
            {
              createdAt: opts.cursor.createdAt,
              code: { lt: opts.cursor.code },
            },
          ],
        }
      : undefined;
    const rows = await this.prisma.shortenedUrl.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { code: "desc" }],
      take: opts.limit + 1,
    });
    const hasMore = rows.length > opts.limit;
    const items = (hasMore ? rows.slice(0, opts.limit) : rows).map(toDomain);
    const last = items[items.length - 1];
    return {
      items,
      hasMore,
      nextCursor:
        hasMore && last ? { createdAt: last.createdAt, code: last.code.value } : null,
    };
  }
}

function toDomain(row: PrismaShortenedUrl): ShortenedUrl {
  return {
    code: ShortCode.fromTrusted(row.code),
    longUrl: LongUrl.fromTrusted(row.longUrl),
    createdAt: row.createdAt,
    clickCount: row.clickCount,
    lastClickedAt: row.lastClickedAt,
  };
}
