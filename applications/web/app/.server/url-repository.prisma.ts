import { Prisma } from "@prisma/client";
import {
  CodeCollisionError,
  type ClickMeta,
  type ShortenedUrl,
  type ShortenedUrlWithStats,
  type UrlRepository,
} from "@url-shortener/engine";
import { prisma } from "./db";

/**
 * Prisma/Postgres adapter for the domain's {@link UrlRepository} port. This is
 * the only place that knows about the database; the engine stays persistence-
 * agnostic and talks to this through the interface.
 */
export class PrismaUrlRepository implements UrlRepository {
  async create(data: {
    code: string;
    originalUrl: string;
  }): Promise<ShortenedUrl> {
    try {
      const row = await prisma.shortenedUrl.create({ data });
      return this.toEntity(row);
    } catch (error) {
      // P2002 = unique constraint violation. Translate the Prisma-specific
      // error into the domain error so the shortener can retry with a new code.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CodeCollisionError(data.code);
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const row = await prisma.shortenedUrl.findUnique({ where: { code } });
    return row ? this.toEntity(row) : null;
  }

  async list(): Promise<ShortenedUrlWithStats[]> {
    const rows = await prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { clicks: true } },
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });
    return rows.map((row) => ({
      ...this.toEntity(row),
      clickCount: row._count.clicks,
      lastClickedAt: row.clicks[0]?.createdAt ?? null,
    }));
  }

  async recordClick(urlId: string, meta: ClickMeta): Promise<void> {
    await prisma.click.create({
      data: {
        urlId,
        referer: meta.referer ?? null,
        userAgent: meta.userAgent ?? null,
      },
    });
  }

  /** Maps a raw Prisma row to the storage-agnostic domain entity. */
  private toEntity(row: {
    id: string;
    code: string;
    originalUrl: string;
    createdAt: Date;
  }): ShortenedUrl {
    return {
      id: row.id,
      code: row.code,
      originalUrl: row.originalUrl,
      createdAt: row.createdAt,
    };
  }
}
