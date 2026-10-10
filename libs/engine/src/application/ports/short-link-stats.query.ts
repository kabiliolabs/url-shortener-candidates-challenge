export interface ShortLinkStats {
  code: string;
  destination: string;
  createdAt: Date;
  clickCount: number;
}

/**
 * Read-model port. Statistics are computed by counting Click records; the click
 * count is not state of the ShortLink aggregate. Results are ordered newest first
 * and capped at `limit`.
 */
export interface ShortLinkStatsQuery {
  listWithClickCounts(limit: number): Promise<ShortLinkStats[]>;
}
