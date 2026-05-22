import { Redis } from "ioredis";

import {
  type ListRecentUrlsUseCase,
  makeListRecentUrlsUseCase,
} from "./application/list-recent-urls.use-case";
import {
  makeResolveShortCodeUseCase,
  type ResolveShortCodeUseCase,
} from "./application/resolve-short-code.use-case";
import {
  makeShortenUrlUseCase,
  type ShortenUrlUseCase,
} from "./application/shorten-url.use-case";
import { consoleLogger, type Logger } from "./domain/ports/logger";
import { RedisCache } from "./infrastructure/cache/redis-cache";
import { NanoidCodeGenerator } from "./infrastructure/code-generator/nanoid-code-generator";
import { createPrismaClient } from "./infrastructure/persistence/prisma-client";
import { PrismaShortenedUrlRepository } from "./infrastructure/persistence/prisma-shortened-url.repository";
import { RedisRateLimiter } from "./infrastructure/rate-limit/redis-rate-limiter";
import { RedisRecentList } from "./infrastructure/recent-list/redis-recent-list";

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface CreateEngineOptions {
  databaseUrl: string;
  redisUrl: string;
  baseUrl: string;
  rateLimit?: RateLimitConfig;
  cacheTtlSeconds?: number;
  recentListSize?: number;
  logger?: Logger;
}

export interface HealthCheckResult {
  db: boolean;
  redis: boolean;
}

export interface Engine {
  shortenUrl: ShortenUrlUseCase;
  resolveShortCode: ResolveShortCodeUseCase;
  listRecentUrls: ListRecentUrlsUseCase;
  healthCheck(): Promise<HealthCheckResult>;
  dispose(): Promise<void>;
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = { maxRequests: 10, windowSeconds: 60 };
const DEFAULT_CACHE_TTL_SECONDS = 3600;
const DEFAULT_RECENT_LIST_SIZE = 100;

export function createEngine(opts: CreateEngineOptions): Engine {
  let forbiddenHost: string;
  try {
    forbiddenHost = new URL(opts.baseUrl).host;
  } catch {
    throw new Error(`createEngine: baseUrl is not a valid URL: ${opts.baseUrl}`);
  }

  const logger = opts.logger ?? consoleLogger;
  const prisma = createPrismaClient({ databaseUrl: opts.databaseUrl });
  const redis = new Redis(opts.redisUrl, { maxRetriesPerRequest: 3 });

  const repository = new PrismaShortenedUrlRepository(prisma);
  const cache = new RedisCache(redis);
  const rateLimit = opts.rateLimit ?? DEFAULT_RATE_LIMIT;
  const rateLimiter = new RedisRateLimiter({
    client: redis,
    maxRequests: rateLimit.maxRequests,
    windowSeconds: rateLimit.windowSeconds,
  });
  const codeGenerator = new NanoidCodeGenerator();
  const recentList = new RedisRecentList({
    client: redis,
    maxSize: opts.recentListSize ?? DEFAULT_RECENT_LIST_SIZE,
  });

  return {
    shortenUrl: makeShortenUrlUseCase({
      repository,
      codeGenerator,
      rateLimiter,
      baseUrl: opts.baseUrl,
      forbiddenHost,
      recentList,
      logger,
    }),
    resolveShortCode: makeResolveShortCodeUseCase({
      repository,
      cache,
      cacheTtlSeconds: opts.cacheTtlSeconds ?? DEFAULT_CACHE_TTL_SECONDS,
      logger,
    }),
    listRecentUrls: makeListRecentUrlsUseCase({
      repository,
      recentList,
      logger,
    }),
    async healthCheck() {
      let db = false;
      let redisOk = false;
      try {
        await prisma.$queryRaw`SELECT 1`;
        db = true;
      } catch (err) {
        logger.warn({ err }, "healthCheck: db ping failed");
      }
      try {
        redisOk = (await redis.ping()) === "PONG";
      } catch (err) {
        logger.warn({ err }, "healthCheck: redis ping failed");
      }
      return { db, redis: redisOk };
    },
    async dispose() {
      try {
        await prisma.$disconnect();
      } catch (err) {
        logger.warn({ err }, "dispose: prisma disconnect failed");
      }
      try {
        await redis.quit();
      } catch (err) {
        logger.warn({ err }, "dispose: redis quit failed");
      }
    },
  };
}
