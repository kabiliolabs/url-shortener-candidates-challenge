export interface ShortUrl {
  readonly id: string;
  readonly code: string;
  readonly originalUrl: string;
  readonly clicks: number;
  readonly createdAt: Date;
}