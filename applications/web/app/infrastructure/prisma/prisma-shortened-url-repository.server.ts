import { Prisma, type PrismaClient, type ShortenedUrl as ShortenedUrlRow } from "@prisma/client";
import {
  DestinationUrl,
  ShortCode,
  ShortCodeCollisionError,
  ShortenedUrl,
  type ShortenedUrlRepository,
  type ShortenedUrlStats,
} from "@url-shortener/engine";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";
const RECORD_NOT_FOUND = "P2025";

/**
 * Driven adapter: implements the domain port on top of Prisma.
 *
 * All Prisma types stop at this file. Nothing above it knows that SQLite, or an
 * ORM, exists.
 */
export class PrismaShortenedUrlRepository implements ShortenedUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(shortenedUrl: ShortenedUrl): Promise<void> {
    try {
      await this.prisma.shortenedUrl.create({
        data: {
          code: shortenedUrl.code.value,
          destination: shortenedUrl.destination.value,
          clicks: shortenedUrl.clicks,
          createdAt: shortenedUrl.createdAt,
          lastVisitedAt: shortenedUrl.lastVisitedAt,
        },
      });
    } catch (error) {
      // Translate the infrastructure failure into the domain's own language, so
      // the use case can retry without knowing anything about Prisma.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new ShortCodeCollisionError(
          `Short code "${shortenedUrl.code.value}" is already taken.`,
        );
      }
      throw error;
    }
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    const row = await this.prisma.shortenedUrl.findUnique({ where: { code: code.value } });
    return row ? toDomain(row) : null;
  }

  async findByDestination(destination: DestinationUrl): Promise<ShortenedUrl | null> {
    const row = await this.prisma.shortenedUrl.findFirst({
      where: { destination: destination.value },
      orderBy: { createdAt: "asc" },
    });
    return row ? toDomain(row) : null;
  }

  async registerClick(code: ShortCode): Promise<ShortenedUrl | null> {
    try {
      // A single atomic UPDATE ... SET clicks = clicks + 1. A read-modify-write
      // would lose clicks whenever two visits overlap.
      const row = await this.prisma.shortenedUrl.update({
        where: { code: code.value },
        data: { clicks: { increment: 1 }, lastVisitedAt: new Date() },
      });
      return toDomain(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === RECORD_NOT_FOUND
      ) {
        return null;
      }
      throw error;
    }
  }

  async listRecent(limit: number): Promise<ShortenedUrl[]> {
    const rows = await this.prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toDomain);
  }

  async stats(): Promise<ShortenedUrlStats> {
    const [totalUrls, aggregate] = await Promise.all([
      this.prisma.shortenedUrl.count(),
      this.prisma.shortenedUrl.aggregate({ _sum: { clicks: true } }),
    ]);
    return { totalUrls, totalClicks: aggregate._sum.clicks ?? 0 };
  }
}

/**
 * Row -> aggregate. Re-validating the stored destination here is defence in
 * depth: even if a row were tampered with, a dangerous scheme can never reach
 * `redirect()` or an `<a href>`.
 */
function toDomain(row: ShortenedUrlRow): ShortenedUrl {
  return new ShortenedUrl(
    ShortCode.parse(row.code),
    DestinationUrl.parse(row.destination),
    row.clicks,
    row.createdAt,
    row.lastVisitedAt,
  );
}
