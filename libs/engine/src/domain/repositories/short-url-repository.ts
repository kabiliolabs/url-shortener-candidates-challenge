import type { ShortUrl } from "../entities/short-url";

export interface UrlStatsItem {
  shortCode: string;
  originalUrl: string;
  clickCount: number;
  createdAt: Date;
  lastClickedAt: Date | null;
}

export interface CreateShortUrlInput {
  shortCode: string;
  originalUrl: string;
}

export class DuplicateShortCodeError extends Error {
  constructor() {
    super("Duplicate short code.");
  }
}

export interface ShortUrlRepository {
  create(input: CreateShortUrlInput): Promise<ShortUrl>;
  findByCode(shortCode: string): Promise<ShortUrl | null>;
  existsByCode(shortCode: string): Promise<boolean>;
  incrementClickCount(shortCode: string, clickedAt: Date): Promise<void>;
  list(limit: number): Promise<UrlStatsItem[]>;
}
