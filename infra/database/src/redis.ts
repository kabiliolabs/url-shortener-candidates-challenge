import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

const redisUrl = process.env.REDIS_URL;
if (!redisUrl && process.env.NODE_ENV === "production") {
  throw new Error("REDIS_URL environment variable is required in production");
}

export const redis =
  globalForRedis.redis ??
  new Redis(redisUrl ?? "redis://localhost:6379", {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
