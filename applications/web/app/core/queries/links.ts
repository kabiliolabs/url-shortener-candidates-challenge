import { Effect } from "effect";
import type { LinkRepository, LinkRecord } from "../repository.js";
import { LinkNotFoundError } from "../errors.js";
import { isValidCode } from "../short-code.js";

export interface LinkDto {
  id: string;
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
  lastClickAt: string | null;
}

function toDto(link: LinkRecord, baseUrl: string): LinkDto {
  return {
    id: link.id,
    code: link.code,
    originalUrl: link.originalUrl,
    shortUrl: `${baseUrl}/go/${link.code}`,
    clickCount: link.clickCount,
    createdAt: link.createdAt.toISOString(),
    lastClickAt: link.lastClickAt ? link.lastClickAt.toISOString() : null,
  };
}

export function makeLinksQuery(repo: LinkRepository) {
  return {
    /** Resolves a short code to its original URL and increments click count */
    resolveAndTrack: (
      code: string,
    ): Effect.Effect<string, LinkNotFoundError> => {
      if (!isValidCode(code))
        return Effect.fail(new LinkNotFoundError({ code }));
      return Effect.tryPromise({
        try: () => repo.trackClick(code),
        catch: () => new LinkNotFoundError({ code }),
      }).pipe(
        Effect.flatMap((url) =>
          url !== null
            ? Effect.succeed(url)
            : Effect.fail(new LinkNotFoundError({ code })),
        ),
      );
    },

    /** Fetch the N most recently created links */
    listRecent: (
      limit: number,
      baseUrl: string,
    ): Effect.Effect<LinkDto[], never> =>
      Effect.tryPromise(() => repo.listRecent(limit)).pipe(
        Effect.map((rows) => rows.map((r) => toDto(r, baseUrl))),
        Effect.orElseSucceed(() => []),
      ),

    /** Fetch all links ordered by most recently created */
    listAll: (baseUrl: string): Effect.Effect<LinkDto[], never> =>
      Effect.tryPromise(() => repo.listAll()).pipe(
        Effect.map((rows) => rows.map((r) => toDto(r, baseUrl))),
        Effect.orElseSucceed(() => []),
      ),
  };
}
