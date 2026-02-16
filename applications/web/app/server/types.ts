export interface ShortenedUrlEntity {
  id: string;
  code: string;
  url: string;
  createdAt: Date;
  clickCount: number;
}

export interface UpdateShortenedUrlInput {
  url?: string;
  code?: string;
}

export interface ShortenUrlResult {
  code: string;
  shortened: ShortenedUrlEntity;
}
