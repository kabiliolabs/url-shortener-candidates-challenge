import { prisma } from "@url-shortener/database";
import type {
  ClickRepository,
  ClickMetadata,
  ClickData,
} from "./click.repository.js";

export class PrismaClickRepository implements ClickRepository {
  async recordClick(
    shortenedUrlId: number,
    metadata: ClickMetadata
  ): Promise<void> {
    await prisma.click.create({
      data: {
        shortenedUrlId,
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
        referer: metadata.referer ?? null,
      },
    });
  }

  async getClicksByUrlId(
    urlId: number,
    options?: { limit?: number; offset?: number }
  ): Promise<ClickData[]> {
    return prisma.click.findMany({
      where: { shortenedUrlId: urlId },
      orderBy: { clickedAt: "desc" },
      take: options?.limit,
      skip: options?.offset,
    });
  }

  async getClickCountByUrlId(urlId: number): Promise<number> {
    return prisma.click.count({
      where: { shortenedUrlId: urlId },
    });
  }
}
