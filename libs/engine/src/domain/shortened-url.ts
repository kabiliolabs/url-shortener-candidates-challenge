/**
 * A persisted shortened URL. This is the domain entity returned by the
 * repository port — it mirrors what storage holds but carries no Prisma types,
 * keeping the engine free of any persistence dependency.
 */
export type ShortenedUrl = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};
