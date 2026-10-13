import {
  Prisma,
  PrismaClient,
  type ShortUrl as PrismaShortUrl,
} from "../generated/prisma/client";
import {
  ShortCodeAlreadyExistsError,
  type CreateShortUrlRecord,
  type ShortUrl,
  type UrlRepository,
} from "@url-shortener/engine";
import type { ClickEvent } from "@url-shortener/engine";

export class PrismaUrlRepository implements UrlRepository {
  constructor(private readonly client: PrismaClient) {}

  async create(input: CreateShortUrlRecord): Promise<ShortUrl> {
    try {
      const record = await this.client.shortUrl.create({
        data: {
          code: input.code,
          originalUrl: input.originalUrl,
          createdAt: input.createdAt,
        },
      });

      return this.toDomain(record);
    } catch (error) {
      if (this.isKnownError(error, "P2002")) {
        throw new ShortCodeAlreadyExistsError(input.code);
      }

      throw error;
    }
  }

  async findAndIncrementClicks(code: string): Promise<ShortUrl | null> {
    try {
      const record = await this.client.$transaction(async (transaction) => {
        const updated = await transaction.shortUrl.update({
          where: { code },
          data: { clicks: { increment: 1 } },
        });

        await transaction.clickEvent.create({
          data: { shortUrlId: updated.id },
        });

        return updated;
      });

      return this.toDomain(record);
    } catch (error) {
      if (this.isKnownError(error, "P2025")) return null;
      throw error;
    }
  }

  async list(): Promise<ShortUrl[]> {
    const records = await this.client.shortUrl.findMany({
      orderBy: [{ createdAt: "desc" }, { code: "desc" }],
    });

    return records.map((record) => this.toDomain(record));
  }

  async delete(code: string): Promise<boolean> {
    try {
      await this.client.shortUrl.delete({ where: { code } });
      return true;
    } catch (error) {
      if (this.isKnownError(error, "P2025")) return false;
      throw error;
    }
  }

  async listClickEvents(code: string): Promise<ClickEvent[]> {
    const record = await this.client.shortUrl.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!record) return [];

    const events = await this.client.clickEvent.findMany({
      where: { shortUrlId: record.id },
      orderBy: { clickedAt: "desc" },
      select: { clickedAt: true },
    });

    return events;
  }

  private toDomain(record: PrismaShortUrl): ShortUrl {
    return {
      code: record.code,
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
      clicks: record.clicks,
    };
  }

  private isKnownError(
    error: unknown,
    code: Prisma.PrismaClientKnownRequestError["code"],
  ): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code;
  }
}
