import type {
  CreateShortenedUrlInput,
  ShortenedUrl,
} from "../../app/domain/models/shortened-url";
import type { ShortenedUrlRepository } from "../../app/domain/repositories/shortened-url.repository";

export function createInMemoryRepository(): ShortenedUrlRepository & {
  records: Map<string, ShortenedUrl>;
} {
  const records = new Map<string, ShortenedUrl>();

  return {
    records,

    async create(input: CreateShortenedUrlInput): Promise<ShortenedUrl> {
      if (records.has(input.code)) {
        throw new Error(`Duplicate code: ${input.code}`);
      }

      const record: ShortenedUrl = {
        id: crypto.randomUUID(),
        code: input.code,
        originalUrl: input.originalUrl,
        clicks: 0,
        createdAt: new Date(),
      };

      records.set(input.code, record);
      return record;
    },

    async findByCode(code: string): Promise<ShortenedUrl | null> {
      return records.get(code) ?? null;
    },

    async incrementClicks(code: string): Promise<void> {
      const record = records.get(code);
      if (record) {
        record.clicks += 1;
      }
    },

    async list(): Promise<ShortenedUrl[]> {
      return [...records.values()].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );
    },
  };
}
