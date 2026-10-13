import { ShortCodeAlreadyExistsError } from "../../src/domain/errors";
import type { ShortUrl } from "../../src/domain/short-url";
import type { ClickEvent } from "../../src/domain/click-event";
import type {
  CreateShortUrlRecord,
  UrlRepository,
} from "../../src/application/ports/url-repository";

export class InMemoryUrlRepository implements UrlRepository {
  private readonly records = new Map<string, ShortUrl>();

  async create(input: CreateShortUrlRecord): Promise<ShortUrl> {
    if (this.records.has(input.code)) {
      throw new ShortCodeAlreadyExistsError(input.code);
    }

    const record: ShortUrl = { ...input, clicks: 0 };
    this.records.set(record.code, record);
    return record;
  }

  async findAndIncrementClicks(code: string): Promise<ShortUrl | null> {
    const record = this.records.get(code);
    if (!record) return null;

    const updated = { ...record, clicks: record.clicks + 1 };
    this.records.set(code, updated);
    return updated;
  }

  async list(): Promise<ShortUrl[]> {
    return [...this.records.values()];
  }

  async delete(code: string): Promise<boolean> {
    return this.records.delete(code);
  }

  async listClickEvents(code: string): Promise<ClickEvent[]> {
    const record = this.records.get(code);
    return Array.from({ length: record?.clicks ?? 0 }, () => ({ clickedAt: record?.createdAt ?? new Date() }));
  }

  seed(record: ShortUrl): void {
    this.records.set(record.code, record);
  }

  find(code: string): ShortUrl | undefined {
    return this.records.get(code);
  }
}
