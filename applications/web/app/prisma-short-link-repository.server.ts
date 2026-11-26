import { Prisma, PrismaClient } from "@prisma/client";
import {
  codeCollisionError,
  type NewShortLink,
  type ShortLink,
  type ShortLinkRepository,
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

function isUniqueViolation(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

function uniqueTarget(error: Prisma.PrismaClientKnownRequestError): string[] {
  const target = error.meta?.target;
  if (!Array.isArray(target)) {
    return [];
  }
  return target.filter((item): item is string => typeof item === "string");
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
    try {
      const row = await this.db.shortLink.create({
        data: { url: link.url, code: link.code },
      });
      return toShortLink(row);
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }

      const target = uniqueTarget(error);
      if (target.includes("url")) {
        const existing = await this.findByUrl(link.url);
        if (existing) {
          return existing;
        }
      }
      if (target.includes("code")) {
        throw codeCollisionError();
      }
      throw error;
    }
  }

  async findByUrl(url: string): Promise<ShortLink | null> {
    const row = await this.db.shortLink.findUnique({ where: { url } });
    return row ? toShortLink(row) : null;
  }

  async list(limit: number): Promise<ShortLink[]> {
    const rows = await this.db.shortLink.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toShortLink);
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
