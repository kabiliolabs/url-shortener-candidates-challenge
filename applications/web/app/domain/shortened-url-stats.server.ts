import type { ShortenedUrlRepository } from "~/domain/repositories/shortened-url.repository";
import { shortenedUrlRepository } from "~/infrastructure/prisma-shortened-url.repository.server";

export type StatsViewData = {
  totalLinks: number;
  totalClicks: number;
  topLinks: Awaited<ReturnType<ShortenedUrlRepository["list"]>>;
  allLinks: Awaited<ReturnType<ShortenedUrlRepository["list"]>>;
  loadError?: string;
};

const TOP_LINKS_LIMIT = 5;

export async function getStatsViewData(
  repository: ShortenedUrlRepository = shortenedUrlRepository,
): Promise<StatsViewData> {
  const allLinks = await repository.list();

  const totalLinks = allLinks.length;
  const totalClicks = allLinks.reduce((sum, link) => sum + link.clicks, 0);

  const topLinks = [...allLinks]
    .sort(
      (a, b) =>
        b.clicks - a.clicks || b.createdAt.getTime() - a.createdAt.getTime(),
    )
    .slice(0, TOP_LINKS_LIMIT);

  return { totalLinks, totalClicks, topLinks, allLinks };
}
