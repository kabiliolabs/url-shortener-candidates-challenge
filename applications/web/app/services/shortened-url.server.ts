import { ShortenedUrlService } from "@url-shortener/engine";
import { NanoidShortCodeGenerator } from "../infrastructure/nanoid-short-code-generator.server";
import { PrismaShortenedUrlRepository } from "../infrastructure/prisma/prisma-shortened-url-repository.server";
import { prisma } from "../infrastructure/prisma/prisma-client.server";

// Punto de composición: conecta el caso de uso con sus adaptadores concretos.
export const shortenedUrlService = new ShortenedUrlService(
  new PrismaShortenedUrlRepository(prisma),
  new NanoidShortCodeGenerator(),
);
