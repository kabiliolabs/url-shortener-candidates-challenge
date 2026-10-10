import { describe, expect, it } from "vitest";
import type { ShortLinkStats, ShortLinkStatsQuery } from "../ports/short-link-stats.query";
import { ListShortLinks } from "./list-short-links";

class FakeShortLinkStatsQuery implements ShortLinkStatsQuery {
  requestedLimits: number[] = [];
  constructor(private readonly stats: ShortLinkStats[]) {}
  async listWithClickCounts(limit: number): Promise<ShortLinkStats[]> {
    this.requestedLimits.push(limit);
    return this.stats.slice(0, limit);
  }
}

describe("ListShortLinks", () => {
  it("returns the links with their click counts as provided by the query", async () => {
    const stats: ShortLinkStats[] = [
      { code: "bbbbbbb", destination: "https://b.example", createdAt: new Date("2026-02-01"), clickCount: 0 },
      { code: "aaaaaaa", destination: "https://a.example", createdAt: new Date("2026-01-01"), clickCount: 7 },
    ];
    const shortLinkStatsQuery = new FakeShortLinkStatsQuery(stats);

    const result = await new ListShortLinks({ shortLinkStatsQuery }).execute();

    expect(result).toEqual(stats);
  });

  it("lists at most the 100 most recent links to keep the public stats view cheap", async () => {
    const shortLinkStatsQuery = new FakeShortLinkStatsQuery([]);

    await new ListShortLinks({ shortLinkStatsQuery }).execute();

    expect(shortLinkStatsQuery.requestedLimits).toEqual([100]);
  });
});
