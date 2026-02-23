import type { ShortLinkEntity } from "../../domain/entities/short-link.entity";
import type {
  CreateShortLinkRecordInput,
  ShortLinkRepositoryPort,
} from "../../application/ports/short-link-repository.port";
import { getPrismaClient } from "./prisma-client";

export class PrismaShortLinkRepository implements ShortLinkRepositoryPort {
  private readonly prisma = getPrismaClient();

  async create(input: CreateShortLinkRecordInput): Promise<ShortLinkEntity> {
    return this.prisma.shortLink.create({
      data: {
        code: input.code,
        originalUrl: input.originalUrl,
      },
    });
  }

  async findByCode(code: string): Promise<ShortLinkEntity | null> {
    return this.prisma.shortLink.findUnique({ where: { code } });
  }

  async existsByCode(code: string): Promise<boolean> {
    const shortLink = await this.prisma.shortLink.findUnique({
      where: { code },
      select: { code: true },
    });

    return Boolean(shortLink);
  }

  async incrementClicks(code: string): Promise<void> {
    await this.prisma.shortLink.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastVisitedAt: new Date(),
      },
    });
  }

  async listRecent(limit: number): Promise<ShortLinkEntity[]> {
    return this.prisma.shortLink.findMany({
      take: limit,
      orderBy: [{ createdAt: "desc" }],
    });
  }
}
