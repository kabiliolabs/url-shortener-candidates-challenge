import type {
  ShortLinkStats,
  ShortLinkStatsQuery,
} from "../ports/short-link-stats.query";

const MAX_LISTED_LINKS = 100;

export interface ListShortLinksDependencies {
  shortLinkStatsQuery: ShortLinkStatsQuery;
}

export class ListShortLinks {
  private readonly shortLinkStatsQuery: ShortLinkStatsQuery;

  constructor(dependencies: ListShortLinksDependencies) {
    this.shortLinkStatsQuery = dependencies.shortLinkStatsQuery;
  }

  execute(): Promise<ShortLinkStats[]> {
    return this.shortLinkStatsQuery.listWithClickCounts(MAX_LISTED_LINKS);
  }
}
