export interface ShortUrl {
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  lastClickedAt: Date | null;
}
