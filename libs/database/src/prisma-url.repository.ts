import { Prisma } from "../generated/prisma/client.js";
import type { UrlDatabase } from "../generated/prisma/client.js";
import { AppError } from "./errors.js";
import { prisma } from "./prisma.js";
import type { CreateUrlData, UrlRepository } from "./url.repository.js";
import type { UrlRecord } from "./url.types.js";

function toUrlRecord(row: UrlDatabase): UrlRecord {
  return {
    id: row.id,
    url: row.url,
    shortCode: row.shortCode,
    shortenCount: row.shortenCount,
    clickCount: row.clickCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapDatabaseError(error: unknown, message: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("This URL already exists", "URL_ALREADY_EXISTS");
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    throw new AppError("Record not found", "RECORD_NOT_FOUND");
  }

  throw new AppError(message, "DATABASE_ERROR");
}

export function createPrismaUrlRepository(): UrlRepository {
  return {
    findByUrl: async (url: string): Promise<UrlRecord | null> => {
      try {
        const row = await prisma.urlDatabase.findUnique({ where: { url } });
        return row ? toUrlRecord(row) : null;
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to find URL");
      }
    },

    findByShortCode: async (shortCode: string): Promise<UrlRecord | null> => {
      try {
        const row = await prisma.urlDatabase.findUnique({ where: { shortCode } });
        return row ? toUrlRecord(row) : null;
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to find short code");
      }
    },

    findAll: async (): Promise<UrlRecord[]> => {
      try {
        const rows = await prisma.urlDatabase.findMany();
        return rows.map(toUrlRecord);
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to get all URLs");
      }
    },

    create: async (data: CreateUrlData): Promise<UrlRecord> => {
      try {
        const row = await prisma.urlDatabase.create({ data });
        return toUrlRecord(row);
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to create URL");
      }
    },

    incrementShortenCount: async (id: number): Promise<UrlRecord> => {
      try {
        const row = await prisma.urlDatabase.update({
          where: { id },
          data: { shortenCount: { increment: 1 } },
        });
        return toUrlRecord(row);
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to increment shorten count");
      }
    },

    incrementClickCount: async (id: number): Promise<void> => {
      try {
        await prisma.urlDatabase.update({
          where: { id },
          data: { clickCount: { increment: 1 } },
        });
      } catch (error: unknown) {
        mapDatabaseError(error, "Failed to increment click count");
      }
    },
  };
}

export const defaultUrlRepository: UrlRepository = createPrismaUrlRepository();
