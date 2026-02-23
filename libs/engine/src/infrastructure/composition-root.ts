import {
  CreateShortLinkUseCase,
  type CreateShortLinkInput,
  type CreateShortLinkResult,
} from "../application/use-cases/create-short-link.use-case";
import {
  ListShortLinksUseCase,
  type ListShortLinksInput,
  type ListShortLinksResult,
} from "../application/use-cases/list-short-links.use-case";
import {
  ResolveShortLinkUseCase,
  type ResolveShortLinkInput,
  type ResolveShortLinkResult,
} from "../application/use-cases/resolve-short-link.use-case";
import { PrismaShortLinkRepository } from "./prisma/prisma-short-link.repository";
import { NanoIdGenerator } from "./id/nanoid-id-generator";
import { FixedWindowRateLimiter } from "./security/fixed-window-rate-limiter";

export interface UrlShortenerApplication {
  createShortLink(input: CreateShortLinkInput): Promise<CreateShortLinkResult>;
  listShortLinks(input?: ListShortLinksInput): Promise<ListShortLinksResult>;
  resolveShortLink(input: ResolveShortLinkInput): Promise<ResolveShortLinkResult>;
}

export interface UrlShortenerApplicationConfig {
  baseUrl: string;
  maxCreatePerMinute?: number;
}

export function createUrlShortenerApplication(
  config: UrlShortenerApplicationConfig,
): UrlShortenerApplication {
  const repository = new PrismaShortLinkRepository();
  const idGenerator = new NanoIdGenerator();
  const abuseProtection = new FixedWindowRateLimiter(
    config.maxCreatePerMinute ?? 20,
    60_000,
  );

  const createShortLinkUseCase = new CreateShortLinkUseCase(
    repository,
    idGenerator,
    abuseProtection,
    config.baseUrl,
  );
  const listShortLinksUseCase = new ListShortLinksUseCase(
    repository,
    config.baseUrl,
  );
  const resolveShortLinkUseCase = new ResolveShortLinkUseCase(repository);

  return {
    createShortLink: (input) => createShortLinkUseCase.execute(input),
    listShortLinks: (input) => listShortLinksUseCase.execute(input),
    resolveShortLink: (input) => resolveShortLinkUseCase.execute(input),
  };
}
