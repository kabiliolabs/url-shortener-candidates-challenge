import type {
  CreateShortenedUrlInput,
  ShortenedUrl,
} from "~/domain/models/shortened-url";
import type { ShortenedUrlRepository } from "~/domain/repositories/shortened-url.repository";
import { prisma } from "./db.server";

export function createPrismaRepository(): ShortenedUrlRepository {
  return {
    async create(input: CreateShortenedUrlInput): Promise<ShortenedUrl> {
      const record = await prisma.shortenedUrl.create({
        data: {
          code: input.code,
          originalUrl: input.originalUrl,
        },
      });

      return toShortenedUrl(record);
    },

    async findByCode(code: string): Promise<ShortenedUrl | null> {
      const record = await prisma.shortenedUrl.findUnique({
        where: { code },
      });

      return record ? toShortenedUrl(record) : null;
    },

    async incrementClicks(code: string): Promise<void> {
      await prisma.shortenedUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    },

    async list(): Promise<ShortenedUrl[]> {
      const records = await prisma.shortenedUrl.findMany({
        orderBy: { createdAt: "desc" },
      });

      return records.map(toShortenedUrl);
    },
  };
}

type PrismaRecord = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};

function toShortenedUrl(record: PrismaRecord): ShortenedUrl {
  return {
    id: record.id,
    code: record.code,
    originalUrl: record.originalUrl,
    clicks: record.clicks,
    createdAt: record.createdAt,
  };
}

export const shortenedUrlRepository = createPrismaRepository();
