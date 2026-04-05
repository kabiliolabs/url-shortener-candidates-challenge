import { getStatsViewData, type StatsViewData } from "@url-shortener/engine";
import { shortenedUrlRepository } from "@url-shortener/engine/server";

export const emptyStats: StatsViewData = {
  totalLinks: 0,
  totalClicks: 0,
  topLinks: [],
  allLinks: [],
};

export async function loadStatsViewData(): Promise<StatsViewData> {
  try {
    return await getStatsViewData(shortenedUrlRepository);
  } catch (error) {
    const loadError =
      error instanceof Error ? error.message : "Failed to load statistics.";
    return { ...emptyStats, loadError };
  }
}
