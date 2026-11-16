import type { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export interface ListUrlsQuery {
  limit?: number;
  offset?: number;
}

export interface UrlPage {
  urls: ShortUrl[];
  limit: number;
  offset: number;
  /** Offset of the next page, or null when this is the last one. */
  nextOffset: number | null;
}

function normalizeLimit(limit?: number): number {
  if (!limit || !Number.isInteger(limit) || limit < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(limit, MAX_PAGE_SIZE);
}

function normalizeOffset(offset?: number): number {
  return offset && Number.isInteger(offset) && offset > 0 ? offset : 0;
}

export class ListUrlsWithStats {
  constructor(private readonly urlRepository: UrlRepository) {}

  async execute(query: ListUrlsQuery = {}): Promise<UrlPage> {
    const limit = normalizeLimit(query.limit);
    const offset = normalizeOffset(query.offset);

    // Fetch one extra row to learn whether another page exists without a COUNT query.
    const rows = await this.urlRepository.list({ limit: limit + 1, offset });
    const hasMore = rows.length > limit;

    return {
      urls: rows.slice(0, limit),
      limit,
      offset,
      nextOffset: hasMore ? offset + limit : null,
    };
  }
}
