import { CodeCollisionError } from "../domain/errors";
import type { LongUrl } from "../domain/long-url";
import type { ShortenedUrl } from "../domain/shortened-url";
import type {
  ListShortenedUrlsOptions,
  ListShortenedUrlsResult,
  ShortenedUrlRepository,
} from "../domain/ports/shortened-url-repository";
import type { ShortCode } from "../domain/short-code";

export class InMemoryShortenedUrlRepository implements ShortenedUrlRepository {
  readonly store = new Map<string, ShortenedUrl>();
  incrementCalls: string[] = [];

  async save(code: ShortCode, longUrl: LongUrl): Promise<ShortenedUrl> {
    if (this.store.has(code.value)) {
      throw new CodeCollisionError(code.value);
    }
    const entity: ShortenedUrl = {
      code,
      longUrl,
      createdAt: new Date(),
      clickCount: 0,
      lastClickedAt: null,
    };
    this.store.set(code.value, entity);
    return entity;
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    return this.store.get(code.value) ?? null;
  }

  async findManyByCodes(codes: string[]): Promise<ShortenedUrl[]> {
    const out: ShortenedUrl[] = [];
    for (const c of codes) {
      const row = this.store.get(c);
      if (row) out.push(row);
    }
    return out;
  }

  async incrementClicks(code: ShortCode): Promise<void> {
    this.incrementCalls.push(code.value);
    const entity = this.store.get(code.value);
    if (!entity) return;
    entity.clickCount += 1;
    entity.lastClickedAt = new Date();
  }

  async list(opts: ListShortenedUrlsOptions): Promise<ListShortenedUrlsResult> {
    const sorted = [...this.store.values()].sort((a, b) => {
      const t = b.createdAt.getTime() - a.createdAt.getTime();
      return t !== 0 ? t : b.code.value.localeCompare(a.code.value);
    });
    const filtered = opts.cursor
      ? sorted.filter((row) => {
          if (!opts.cursor) return true;
          if (row.createdAt.getTime() < opts.cursor.createdAt.getTime()) return true;
          if (row.createdAt.getTime() > opts.cursor.createdAt.getTime()) return false;
          return row.code.value < opts.cursor.code;
        })
      : sorted;
    const slice = filtered.slice(0, opts.limit + 1);
    const hasMore = slice.length > opts.limit;
    const items = hasMore ? slice.slice(0, opts.limit) : slice;
    const last = items[items.length - 1];
    return {
      items,
      hasMore,
      nextCursor:
        hasMore && last ? { createdAt: last.createdAt, code: last.code.value } : null,
    };
  }

  seed(entity: ShortenedUrl): void {
    this.store.set(entity.code.value, entity);
  }
}
