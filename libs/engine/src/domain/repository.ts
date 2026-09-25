import type { ShortUrl } from "./short-url";

export interface CreateShortUrlInput {
  code: string;
  originalUrl: string;
}

/**
 * Persistence-agnostic contract for storing/retrieving ShortUrl entities.
 * Implementations (e.g. PrismaShortUrlRepository) own all storage-specific
 * concerns; this interface only ever uses domain types.
 *
 * create() MUST throw ShortCodeCollisionError (see ./errors) if `code`
 * already exists, so ShortUrlService's retry loop can detect a collision.
 */
export interface IShortUrlRepository {
  create(input: CreateShortUrlInput): Promise<ShortUrl>;
  findByCode(code: string): Promise<ShortUrl | null>;
  list(): Promise<ShortUrl[]>;
  incrementClick(code: string): Promise<ShortUrl>;
}
