import { Prisma, PrismaClient } from "@prisma/client";
import type {
  NewShortLink,
  ShortLink,
  ShortLinkRepository,
} from "@url-shortener/engine";
import { prisma } from "./prisma.server";

function toShortLink(row: {
  id: string;
  url: string;
  code: string;
  clicks: number;
  createdAt: Date;
}): ShortLink {
  return {
    id: row.id,
    url: row.url,
    code: row.code,
    clicks: row.clicks,
    createdAt: row.createdAt,
  };
}

function isMissingRecord(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export class PrismaShortLinkRepository implements ShortLinkRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(link: NewShortLink): Promise<ShortLink> {
    const row = await this.db.shortLink.create({
      data: { url: link.url, code: link.code },
    });
    return toShortLink(row);
  }

  async findByUrl(url: string): Promise<ShortLink | null> {
    const row = await this.db.shortLink.findUnique({ where: { url } });
    return row ? toShortLink(row) : null;
  }

  async incrementClicks(code: string): Promise<ShortLink | null> {
    try {
      const row = await this.db.shortLink.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
      return toShortLink(row);
    } catch (error) {
      if (isMissingRecord(error)) {
        return null;
      }
      throw error;
    }
  }
}

export const shortLinkRepository = new PrismaShortLinkRepository(prisma);
