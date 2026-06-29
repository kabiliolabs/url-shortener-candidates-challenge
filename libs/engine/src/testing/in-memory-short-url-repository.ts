import { DuplicateCodeError } from "../domain/errors";
import type {
  NewShortUrl,
  ShortUrlRepository,
} from "../domain/ports/short-url-repository";
import type { ShortenedUrl } from "../domain/shortened-url";

/**
 * In-memory `ShortUrlRepository` for unit tests. Mirrors the production
 * adapter's contract — notably it throws {@link DuplicateCodeError} on a code
 * conflict, so the create use-case's retry path can be exercised without a DB.
 *
 * Lives in `testing/` (not `infrastructure/`) and is intentionally NOT
 * re-exported from the production `index.ts`.
 */
export class InMemoryShortUrlRepository implements ShortUrlRepository {
  private readonly byCode = new Map<string, ShortenedUrl>();
  private seq = 0;

  async save({ code, originalUrl }: NewShortUrl): Promise<ShortenedUrl> {
    if (this.byCode.has(code)) {
      throw new DuplicateCodeError(code);
    }

    const record: ShortenedUrl = {
      id: String(++this.seq),
      code,
      originalUrl,
      clicks: 0,
      createdAt: new Date(),
    };
    this.byCode.set(code, record);
    return { ...record };
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const found = this.byCode.get(code);
    return found ? { ...found } : null;
  }

  async incrementClicks(code: string): Promise<void> {
    const found = this.byCode.get(code);
    if (found) {
      found.clicks += 1;
    }
  }

  async findAll(): Promise<ShortenedUrl[]> {
    return [...this.byCode.values()].map((record) => ({ ...record }));
  }
}
