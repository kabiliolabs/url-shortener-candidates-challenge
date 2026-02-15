/**
 * Backend-only types. Do not import in frontend (api/, components/, routes that use client).
 */

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
