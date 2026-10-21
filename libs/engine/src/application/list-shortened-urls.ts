import type { ShortenedUrl } from "../domain/shortened-url";
import type {
  ShortenedUrlRepository,
  ShortenedUrlStats,
} from "../domain/shortened-url-repository";

const DEFAULT_LIMIT = 50;

/** Use case: feed the dashboard (recent links + aggregate counters). */
export class ListShortenedUrls {
  constructor(private readonly repository: ShortenedUrlRepository) {}

  async execute(
    limit: number = DEFAULT_LIMIT,
  ): Promise<{ urls: ShortenedUrl[]; stats: ShortenedUrlStats }> {
    const [urls, stats] = await Promise.all([
      this.repository.listRecent(limit),
      this.repository.stats(),
    ]);
    return { urls, stats };
  }
}
