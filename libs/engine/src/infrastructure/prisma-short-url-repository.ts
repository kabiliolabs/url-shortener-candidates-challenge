import type { PrismaClient, ShortUrl as ShortUrlRow } from "@prisma/client";
import { ShortCodeAlreadyExists } from "../domain/errors";
import type { OriginalUrl } from "../domain/original-url";
import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../domain/short-url-repository";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

export class PrismaShortUrlRepository implements ShortUrlRepository {
  // The client is injected, and only its type is imported, so loading this
  // module never opens a database connection.
  constructor(private readonly prisma: PrismaClient) {}

  async create(code: string, originalUrl: OriginalUrl): Promise<ShortUrl> {
    try {
      const row = await this.prisma.shortUrl.create({
        data: { code, originalUrl: originalUrl.value },
      });
      return toShortUrl(row);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) {
        throw new ShortCodeAlreadyExists(code);
      }
      throw error;
    }
  }

  async registerClick(code: string): Promise<ShortUrl | null> {
    // One `UPDATE ... SET clicks = clicks + 1 ... RETURNING`. Reading the row and
    // writing clicks + 1 back would lose clicks under concurrency.
    const rows = await this.prisma.shortUrl.updateManyAndReturn({
      where: { code },
      data: { clicks: { increment: 1 } },
    });
    const row = rows.at(0);
    return row ? toShortUrl(row) : null;
  }

  async list(limit: number): Promise<ShortUrl[]> {
    const rows = await this.prisma.shortUrl.findMany({
      // id breaks ties between rows created in the same millisecond.
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit,
    });
    return rows.map(toShortUrl);
  }
}

// Checked by error code instead of `instanceof PrismaClientKnownRequestError`:
// if the bundler ends up with a second copy of the Prisma runtime, the class
// identity differs and `instanceof` is silently false.
function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

// Drops the surrogate id so it never leaves the infrastructure layer.
function toShortUrl(row: ShortUrlRow): ShortUrl {
  return {
    code: row.code,
    originalUrl: row.originalUrl,
    clicks: row.clicks,
    createdAt: row.createdAt,
  };
}
