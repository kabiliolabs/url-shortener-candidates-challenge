export interface ShortenedUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  clickCount: number;
  createdAt: Date;
  deletedAt: Date | null;
}
