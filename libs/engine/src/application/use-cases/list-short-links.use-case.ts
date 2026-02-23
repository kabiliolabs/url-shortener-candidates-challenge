import type { ShortLinkRepositoryPort } from "../ports/short-link-repository.port";

export interface ListShortLinksInput {
  limit?: number;
}

export interface ShortLinkListItem {
  code: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  lastVisitedAt: string | null;
}

export interface ListShortLinksResult {
  items: ShortLinkListItem[];
}

export class ListShortLinksUseCase {
  constructor(
    private readonly repository: ShortLinkRepositoryPort,
    private readonly baseUrl: string,
  ) {}

  async execute(input: ListShortLinksInput = {}): Promise<ListShortLinksResult> {
    const limit = Math.min(Math.max(input.limit ?? 50, 1), 200);

    const shortLinks = await this.repository.listRecent(limit);

    return {
      items: shortLinks.map((shortLink) => ({
        code: shortLink.code,
        shortUrl: `${this.baseUrl}/s/${shortLink.code}`,
        originalUrl: shortLink.originalUrl,
        clicks: shortLink.clicks,
        createdAt: shortLink.createdAt.toISOString(),
        lastVisitedAt: shortLink.lastVisitedAt?.toISOString() ?? null,
      })),
    };
  }
}
