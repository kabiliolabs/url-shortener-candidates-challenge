import { ListUrlsWithStats } from "./application/list-urls-with-stats";
import { ResolveAndTrackClick } from "./application/resolve-and-track-click";
import { ShortenUrl } from "./application/shorten-url";
import { InMemoryUrlRepository } from "./infrastructure/in-memory-url-repository";
import { Base62CodeGenerator } from "./infrastructure/base62-code-generator";
import { PrismaUrlRepository } from "./infrastructure/prisma-url-repository";
import { prisma } from "./infrastructure/prisma-client";
import type { UrlRepository } from "./domain/url-repository";

export function createShortenerApp(
  urlRepository: UrlRepository = new InMemoryUrlRepository(),
) {
  const codeGenerator = new Base62CodeGenerator();

  return {
    shortenUrl: new ShortenUrl(urlRepository, codeGenerator),
    resolveAndTrackClick: new ResolveAndTrackClick(urlRepository),
    listUrlsWithStats: new ListUrlsWithStats(urlRepository),
  };
}

export const shortenerApp = createShortenerApp(new PrismaUrlRepository(prisma));
