import {
  Prisma,
  type ShortenedUrl as PrismaShortenedUrl,
} from "../../generated/prisma/client";
import type { ShortenedUrl } from "../../domain/entities/shortened-url";
import { DuplicateShortCodeError } from "../../domain/errors/duplicate-short-code.error";
import type {
  CreateShortenedUrlData,
  UrlRepository,
} from "../../domain/repositories/url-repository";
import { prisma } from "../persistence/prisma-client";

function toDomain(record: PrismaShortenedUrl): ShortenedUrl {
  return {
    id: record.id,
    originalUrl: record.originalUrl,
    shortCode: record.shortCode,
    clickCount: record.clickCount,
    createdAt: record.createdAt,
    deletedAt: record.deletedAt,
  };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

export class PrismaUrlRepository implements UrlRepository {
  async create({
    originalUrl,
    shortCode,
  }: CreateShortenedUrlData): Promise<ShortenedUrl> {
    try {
      const record = await prisma.shortenedUrl.create({
        data: { originalUrl, shortCode },
      });
      return toDomain(record);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new DuplicateShortCodeError(shortCode);
      }
      throw error;
    }
  }

  async existsByCode(shortCode: string): Promise<boolean> {
    const record = await prisma.shortenedUrl.findUnique({
      where: { shortCode },
      select: { id: true },
    });
    return record !== null;
  }

  async findActiveByCode(shortCode: string): Promise<ShortenedUrl | null> {
    const record = await prisma.shortenedUrl.findFirst({
      where: { shortCode, deletedAt: null },
    });
    return record ? toDomain(record) : null;
  }

  async findAllActive(): Promise<ShortenedUrl[]> {
    const records = await prisma.shortenedUrl.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return records.map(toDomain);
  }

  async incrementClickCount(id: string): Promise<void> {
    await prisma.shortenedUrl.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });
  }

  async softDeleteByCode(shortCode: string): Promise<boolean> {
    const result = await prisma.shortenedUrl.updateMany({
      where: { shortCode, deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return result.count > 0;
  }
}
