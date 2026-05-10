export interface ClickMetadata {
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
}

export interface ClickData {
  id: bigint;
  shortenedUrlId: number;
  clickedAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  referer: string | null;
}

export interface DailyClickCount {
  date: string; // ISO date string "YYYY-MM-DD"
  count: number;
}

export interface DailyClickCountByUrl {
  urlId: number;
  date: string;
  count: number;
}

export interface ClickRepository {
  recordClick(
    shortenedUrlId: number,
    metadata: ClickMetadata
  ): Promise<void>;
  getClicksByUrlId(
    urlId: number,
    options?: { limit?: number; offset?: number }
  ): Promise<ClickData[]>;
  getClickCountByUrlId(urlId: number): Promise<number>;
  getClicksByDay(urlId: number, days?: number): Promise<DailyClickCount[]>;
  getClicksByDayForUrls(urlIds: number[], days?: number): Promise<DailyClickCountByUrl[]>;
}
