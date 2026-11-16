export interface ShortUrl {
  readonly code: string;
  readonly originalUrl: string;
  readonly clicks: number;
  readonly createdAt: Date;
}
