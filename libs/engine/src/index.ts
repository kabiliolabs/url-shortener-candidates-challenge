import { PrismaClient } from "@prisma/client";
import { ShortUrlService } from "./application/short-url-service";
import { PrismaShortUrlRepository } from "./infrastructure/prisma-short-url-repository";

export { ShortUrlService } from "./application/short-url-service";
export type { CreateShortUrlResult } from "./application/short-url-service";

export {
  InvalidUrlError,
  ShortCodeExhaustedError,
  ShortUrlNotFoundError,
} from "./domain/errors";
export type { IShortUrlRepository } from "./domain/repository";
export type { ShortUrl } from "./domain/short-url";

/** Wires a real PrismaClient into PrismaShortUrlRepository into ShortUrlService. */
export function createShortUrlService(): ShortUrlService {
  const prisma = new PrismaClient();
  return new ShortUrlService(new PrismaShortUrlRepository(prisma));
}
