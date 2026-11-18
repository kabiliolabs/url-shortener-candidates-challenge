import type { ShortenedUrl } from "../entities/shortened-url";

export interface CreateShortenedUrlData {
  originalUrl: string;
  shortCode: string;
}

export interface UrlRepository {
  create(data: CreateShortenedUrlData): Promise<ShortenedUrl>;

  existsByCode(shortCode: string): Promise<boolean>;

  findActiveByCode(shortCode: string): Promise<ShortenedUrl | null>;

  findAllActive(): Promise<ShortenedUrl[]>;

  incrementClickCount(id: string): Promise<void>;

  softDeleteByCode(shortCode: string): Promise<boolean>;
}
