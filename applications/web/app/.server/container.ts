import {
  ListShortLinks,
  ResolveShortLink,
  ShortenUrl,
} from "@url-shortener/engine/application";
import {
  createPrismaClient,
  CryptoShortCodeGenerator,
  JsonConsoleLogger,
  PrismaClickRepository,
  PrismaShortLinkRepository,
  PrismaShortLinkStatsQuery,
  SystemClock,
} from "@url-shortener/engine/infrastructure";

import { loadConfig, type Config } from "./config";

type PrismaClient = ReturnType<typeof createPrismaClient>;

export interface Container {
  publicUrl: string;
  shortenUrl: ShortenUrl;
  resolveShortLink: ResolveShortLink;
  listShortLinks: ListShortLinks;
}

function createContainer(config: Config, prisma: PrismaClient): Container {
  const clock = new SystemClock();
  const logger = new JsonConsoleLogger(clock);
  const shortCodeGenerator = new CryptoShortCodeGenerator();
  const shortLinkRepository = new PrismaShortLinkRepository(prisma);
  const clickRepository = new PrismaClickRepository(prisma);
  const shortLinkStatsQuery = new PrismaShortLinkStatsQuery(prisma);

  return {
    publicUrl: config.publicUrl,
    shortenUrl: new ShortenUrl({
      shortLinkRepository,
      shortCodeGenerator,
      clock,
      ownHost: config.publicUrl,
    }),
    resolveShortLink: new ResolveShortLink({
      shortLinkRepository,
      clickRepository,
      clock,
      logger,
    }),
    listShortLinks: new ListShortLinks({ shortLinkStatsQuery }),
  };
}

const globalForPrisma = globalThis as typeof globalThis & {
  __prisma?: PrismaClient;
};

function resolvePrisma(config: Config): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient(config.databaseUrl);
  }
  return (globalForPrisma.__prisma ??= createPrismaClient(config.databaseUrl));
}

const config = loadConfig(process.env);

export const container = createContainer(config, resolvePrisma(config));
