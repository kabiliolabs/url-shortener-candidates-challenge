import type { ShortenedUrl } from "../shortened-url";

export type NewShortUrl = {
  code: string;
  originalUrl: string;
};

/**
 * Storage port for short URLs. Use-cases depend on this interface, never on a
 * concrete database (DIP). Implementations: a Prisma adapter in the web app
 * (runtime) and an in-memory test double (unit tests).
 *
 * Implementations must throw {@link DuplicateCodeError} from `save` when `code`
 * already exists — they do not generate or regenerate codes themselves.
 */
export interface ShortUrlRepository {
  save(input: NewShortUrl): Promise<ShortenedUrl>;

  findByCode(code: string): Promise<ShortenedUrl | null>;

  /** Atomic counter bump — not read-modify-write — to avoid lost updates under concurrency. */
  incrementClicks(code: string): Promise<void>;

  findAll(): Promise<ShortenedUrl[]>;
}
