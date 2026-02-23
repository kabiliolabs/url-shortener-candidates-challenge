export interface ShortLinkEntity {
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  lastVisitedAt: Date | null;
}
