import { Prisma, type PrismaClient } from "@prisma/client";
import { ShortCodeCollisionError } from "../domain/errors";
import type { CreateShortUrlInput, IShortUrlRepository } from "../domain/repository";
import type { ShortUrl } from "../domain/short-url";

const UNIQUE_CONSTRAINT_VIOLATION = "P2002";

/** The only file in libs/engine allowed to import @prisma/client. */
export class PrismaShortUrlRepository implements IShortUrlRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateShortUrlInput): Promise<ShortUrl> {
    try {
      return await this.prisma.shortUrl.create({
        data: { code: input.code, originalUrl: input.originalUrl },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_VIOLATION
      ) {
        throw new ShortCodeCollisionError(input.code);
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortUrl | null> {
    return this.prisma.shortUrl.findUnique({ where: { code } });
  }

  async list(): Promise<ShortUrl[]> {
    return this.prisma.shortUrl.findMany({ orderBy: { createdAt: "desc" } });
  }

  async incrementClick(code: string): Promise<ShortUrl> {
    return this.prisma.shortUrl.update({
      where: { code },
      data: { clickCount: { increment: 1 }, lastClickedAt: new Date() },
    });
  }
}
