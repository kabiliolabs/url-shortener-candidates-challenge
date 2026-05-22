import type { ShortenedUrl } from "../domain/shortened-url";
import { consoleLogger, type Logger } from "../domain/ports/logger";
import type { RecentList } from "../domain/ports/recent-list";
import type { ShortenedUrlRepository } from "../domain/ports/shortened-url-repository";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface ListRecentUrlsInput {
  limit?: number;
}

export interface ListRecentUrlsDeps {
  recentList: RecentList;
  repository: ShortenedUrlRepository;
  defaultLimit?: number;
  maxLimit?: number;
  logger?: Logger;
}

export type ListRecentUrlsUseCase = (
  input?: ListRecentUrlsInput,
) => Promise<ShortenedUrl[]>;

export function makeListRecentUrlsUseCase(
  deps: ListRecentUrlsDeps,
): ListRecentUrlsUseCase {
  const defaultLimit = deps.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = deps.maxLimit ?? MAX_LIMIT;
  const logger = deps.logger ?? consoleLogger;

  return async function listRecentUrls(input = {}) {
    const limit = Math.min(
      maxLimit,
      Math.max(1, Math.floor(input.limit ?? defaultLimit)),
    );
    let codes: string[];
    try {
      codes = await deps.recentList.range(limit);
    } catch (err) {
      // Redis miss / outage shouldn't take down the home page.
      logger.warn(
        { err },
        "listRecentUrls: recent-list range failed; falling back to DB",
      );
      codes = [];
    }
    if (codes.length === 0) {
      // Cold cache (fresh Redis or after a FLUSHALL): walk the DB instead.
      const fallback = await deps.repository.list({ limit });
      return fallback.items;
    }
    const rows = await deps.repository.findManyByCodes(codes);
    const byCode = new Map(rows.map((row) => [row.code.value, row]));
    return codes.flatMap((code) => {
      const row = byCode.get(code);
      return row ? [row] : [];
    });
  };
}
