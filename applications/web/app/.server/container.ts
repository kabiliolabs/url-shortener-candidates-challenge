import { ListShortUrls, ResolveShortUrl, ShortenUrl, systemClock } from "@url-shortener/engine";
import {
  CryptoShortCodeGenerator,
  getPrismaClient,
  InMemoryRateLimiter,
  PrismaShortUrlRepository,
} from "@url-shortener/infrastructure";
import { env } from "./env";

// Composition root: the only place that decides which adapter goes behind each port.
// Routes import the use cases from here and never touch Prisma directly.

const repository = new PrismaShortUrlRepository(getPrismaClient());

export const shortenUrl = new ShortenUrl({
  repository,
  codeGenerator: new CryptoShortCodeGenerator(),
  rateLimiter: new InMemoryRateLimiter({ limit: 10, windowMs: 60_000 }),
  clock: systemClock,
  ownHost: env.publicUrl.host,
});

export const resolveShortUrl = new ResolveShortUrl({ repository, clock: systemClock });

export const listShortUrls = new ListShortUrls({ repository });
