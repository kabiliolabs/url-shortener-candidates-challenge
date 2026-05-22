import { createEngine, type Engine } from "@url-shortener/engine";

import { logger } from "./logger.server";

declare global {
  // eslint-disable-next-line no-var
  var __urlShortenerEngine: Engine | undefined;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function intEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

function build(): Engine {
  return createEngine({
    databaseUrl: requireEnv("DATABASE_URL"),
    redisUrl: requireEnv("REDIS_URL"),
    baseUrl: requireEnv("PUBLIC_URL"),
    cacheTtlSeconds: intEnv("CACHE_TTL_SEC", 3600),
    rateLimit: {
      maxRequests: intEnv("RATE_LIMIT_MAX", 10),
      windowSeconds: intEnv("RATE_LIMIT_WINDOW_SEC", 60),
    },
    logger,
  });
}

let engineInstance: Engine | undefined;

export function getEngine(): Engine {
  // In dev we stash on globalThis so Vite HMR module re-evaluation doesn't
  // spawn a new Redis/Prisma client on every code edit.
  if (process.env.NODE_ENV !== "production") {
    if (!globalThis.__urlShortenerEngine) {
      globalThis.__urlShortenerEngine = build();
    }
    return globalThis.__urlShortenerEngine;
  }
  if (!engineInstance) {
    engineInstance = build();
  }
  return engineInstance;
}

// Drain Prisma/Redis on container stop so in-flight queries don't error and
// pool connections close cleanly. react-router-serve hands SIGTERM straight
// to the Node process; we listen at module-load so the hook is in place
// before the first request lands.
let shuttingDown = false;
async function gracefulShutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, "shutdown: disposing engine");
  const active = engineInstance ?? globalThis.__urlShortenerEngine;
  try {
    await active?.dispose();
  } catch (err) {
    logger.warn({ err }, "shutdown: dispose threw");
  } finally {
    process.exit(0);
  }
}
process.once("SIGTERM", gracefulShutdown);
process.once("SIGINT", gracefulShutdown);
