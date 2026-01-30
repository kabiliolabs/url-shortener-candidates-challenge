import type { ShortenedUrl } from '../domain/entities/shortened-url';
import type { ShortCode } from '../domain/value-objects/short-code';

export interface UrlRepositoryPort {
  save(shortUrl: ShortenedUrl): Promise<void>;
  findByCode(code: ShortCode): Promise<ShortenedUrl | null>;
  incrementClicks(code: ShortCode): Promise<number>;
  exists(code: string): Promise<boolean>;
  listAll(): Promise<ShortenedUrl[]>;
}