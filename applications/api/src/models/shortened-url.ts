export interface ShortenedUrl {
  code: string;
  url: string;
  createdAt: Date;
  clicks: number;
}

export interface CreateShortenedUrlInput {
  url: string;
}
