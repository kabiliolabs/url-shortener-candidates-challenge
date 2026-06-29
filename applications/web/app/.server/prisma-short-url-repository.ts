import { Prisma, type PrismaClient } from "@prisma/client";
import {
  DuplicateCodeError,
  type ShortUrlRepository,
  type NewShortUrl,
  type ShortenedUrl,
} from "@url-shortener/engine";

export function createPrismaShortUrlRepository(
  prisma: PrismaClient,
): ShortUrlRepository {
  return {
    async save({ code, originalUrl }: NewShortUrl): Promise<ShortenedUrl> {
      try {
        return await prisma.shortUrl.create({ data: { code, originalUrl } });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new DuplicateCodeError(code);
        }
        throw error;
      }
    },

    findByCode(code: string): Promise<ShortenedUrl | null> {
      return prisma.shortUrl.findUnique({ where: { code } });
    },

    async incrementClicks(code: string): Promise<void> {
      await prisma.shortUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    },

    findAll(): Promise<ShortenedUrl[]> {
      return prisma.shortUrl.findMany({ orderBy: { createdAt: "desc" } });
    },
  };
}
