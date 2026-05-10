export { prisma } from "./prisma.js";
export { Prisma } from "@prisma/client";
export { redis } from "./redis.js";

export async function disconnectAll(): Promise<void> {
  const { prisma } = await import("./prisma.js");
  const { redis } = await import("./redis.js");
  await Promise.allSettled([
    prisma.$disconnect(),
    redis.status !== "close" ? redis.quit() : Promise.resolve(),
  ]);
}
