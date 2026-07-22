import {
  Prisma,
  PrismaClient,
  type ShortenedUrl as PrismaShortenedUrl,
} from "@prisma/client";
import { DuplicateCodeError } from "../domain/errors.js";
import type { ShortenedUrl } from "../models/shortened-url.js";
import type { UrlRepository as UrlRepositoryContract } from "../types/url-repository.js";

export class UrlRepository implements UrlRepositoryContract {
  constructor(private readonly prisma: PrismaClient) {}

  async create(url: ShortenedUrl): Promise<void> {
    try {
      await this.prisma.shortenedUrl.create({ data: url });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new DuplicateCodeError();
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const url = await this.prisma.shortenedUrl.findUnique({ where: { code } });
    return url ? toShortenedUrl(url) : null;
  }

  async findAll(limit: number): Promise<ShortenedUrl[]> {
    const urls = await this.prisma.shortenedUrl.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return urls.map(toShortenedUrl);
  }

  async incrementClicks(code: string): Promise<ShortenedUrl | null> {
    try {
      const url = await this.prisma.shortenedUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
      return toShortenedUrl(url);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}

function toShortenedUrl({ id: _id, ...url }: PrismaShortenedUrl): ShortenedUrl {
  return url;
}
