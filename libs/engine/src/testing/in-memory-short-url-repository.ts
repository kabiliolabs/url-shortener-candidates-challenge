import { DuplicateCodeError } from "../domain/errors";
import type {
  NewShortUrl,
  ShortUrlRepository,
} from "../domain/ports/short-url-repository";
import type { ShortenedUrl } from "../domain/shortened-url";

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
