export type ShortenedUrl = {
  id: string;
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};

export type CreateShortenedUrlInput = {
  code: string;
  originalUrl: string;
};
