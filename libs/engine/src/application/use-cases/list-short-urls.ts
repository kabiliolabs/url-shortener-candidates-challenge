import type { ShortUrlRepository } from "../../domain/short-url/short-url-repository";
import { toShortUrlDto, type ShortUrlDto } from "../short-url-dto";

export interface ShortUrlPage {
  items: ShortUrlDto[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Paginated list of short URLs with their stats, newest first (SPEC-005). */
export class ListShortUrls {
  static readonly PAGE_SIZE = 20;

  constructor(private readonly deps: { repository: ShortUrlRepository }) {}

  async execute(input: { page: number }): Promise<ShortUrlPage> {
    // Page comes straight from the query string, so anything weird falls back to 1.
    const page = Number.isInteger(input.page) && input.page >= 1 ? input.page : 1;
    const pageSize = ListShortUrls.PAGE_SIZE;

    const { items, total } = await this.deps.repository.list({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    });

    return {
      items: items.map(toShortUrlDto),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}
