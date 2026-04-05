import type {
  CreateShortenedUrlInput,
  ShortenedUrl,
} from "~/domain/models/shortened-url";

export interface ShortenedUrlRepository {
  create(input: CreateShortenedUrlInput): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  incrementClicks(code: string): Promise<void>;
  list(): Promise<ShortenedUrl[]>;
}
