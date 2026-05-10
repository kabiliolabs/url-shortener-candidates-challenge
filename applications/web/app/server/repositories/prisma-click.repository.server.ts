import { prisma, Prisma } from "@url-shortener/database";
import type {
  ClickRepository,
  ClickMetadata,
  ClickData,
  DailyClickCount,
  DailyClickCountByUrl,
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

  async getClicksByDay(urlId: number, days = 7): Promise<DailyClickCount[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT DATE("clickedAt")::text as date, COUNT(*) as count
      FROM "Click"
      WHERE "shortenedUrlId" = ${urlId}
        AND "clickedAt" >= ${since}
      GROUP BY DATE("clickedAt")
      ORDER BY date ASC
    `;

    return results.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  async getClicksByDayForUrls(urlIds: number[], days = 7): Promise<DailyClickCountByUrl[]> {
    if (urlIds.length === 0) return [];

    const since = new Date();
    since.setDate(since.getDate() - days);

    const results = await prisma.$queryRaw<{ shortenedUrlId: number; date: string; count: bigint }[]>`
      SELECT "shortenedUrlId", DATE("clickedAt")::text as date, COUNT(*) as count
      FROM "Click"
      WHERE "shortenedUrlId" IN (${Prisma.join(urlIds)})
        AND "clickedAt" >= ${since}
      GROUP BY "shortenedUrlId", DATE("clickedAt")
      ORDER BY "shortenedUrlId", date ASC
    `;

    return results.map((r) => ({
      urlId: r.shortenedUrlId,
      date: r.date,
      count: Number(r.count),
    }));
  }
}
