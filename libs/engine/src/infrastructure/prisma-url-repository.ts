import { CodeAlreadyExistsError } from "../domain/errors";
import type { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";
import type { PrismaClient } from "../generated/prisma/client";

const hasErrorCode = (error: unknown, code: string): boolean =>
  typeof error === "object" && error !== null && "code" in error && error.code === code;

export class PrismaUrlRepository implements UrlRepository {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async create(input: { code: string; originalUrl: string }): Promise<ShortUrl> {
    try {
      return await this.prisma.shortUrl.create({ data: input });
    } catch (error) {
      // P2002 = unique constraint violation: another URL already owns this code.
      if (hasErrorCode(error, "P2002")) throw new CodeAlreadyExistsError(input.code);
      throw error;
    }
  }

  findByCode(code: string): Promise<ShortUrl | null> {
    return this.prisma.shortUrl.findUnique({ where: { code } });
  }

  async registerClick(code: string): Promise<ShortUrl | null> {
    try {
      // Single atomic UPDATE ... SET clicks = clicks + 1, so concurrent clicks aren't lost.
      return await this.prisma.shortUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    } catch (error) {
      // P2025 = record not found.
      if (hasErrorCode(error, "P2025")) return null;
      throw error;
    }
  }

  list(): Promise<ShortUrl[]> {
    return this.prisma.shortUrl.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }
}