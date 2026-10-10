import type { ShortLinkStats, ShortLinkStatsQuery } from "../../../application";
import type { PrismaClient } from "./generated/client";

export class PrismaShortLinkStatsQuery implements ShortLinkStatsQuery {
  constructor(private readonly prismaClient: PrismaClient) {}

  async listWithClickCounts(limit: number): Promise<ShortLinkStats[]> {
    const rows = await this.prismaClient.shortLink.findMany({
      include: { _count: { select: { clicks: true } } },
      orderBy: [{ createdAt: "desc" }, { code: "asc" }],
      take: limit,
    });

    return rows.map((row) => ({
      code: row.code,
      destination: row.destination,
      createdAt: row.createdAt,
      clickCount: row._count.clicks,
    }));
  }
}
