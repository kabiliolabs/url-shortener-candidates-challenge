/**
 * Composition root.
 *
 * The only place where a concrete adapter is wired to a use case. Routes import
 * use cases from here and never touch Prisma, which is what keeps the
 * dependency arrows pointing inwards.
 */
import {
  ListShortenedUrls,
  ResolveShortenedUrl,
  ShortenUrl,
} from "@url-shortener/engine";
import { prisma } from "./infrastructure/prisma/client.server";
import { PrismaShortenedUrlRepository } from "./infrastructure/prisma/prisma-shortened-url-repository.server";

const repository = new PrismaShortenedUrlRepository(prisma);

export const shortenUrl = new ShortenUrl(repository);
export const resolveShortenedUrl = new ResolveShortenedUrl(repository);
export const listShortenedUrls = new ListShortenedUrls(repository);
