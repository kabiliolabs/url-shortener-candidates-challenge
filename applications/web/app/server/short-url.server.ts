import { randomInt } from "node:crypto";
import {
  createShortUrl,
  listShortUrls,
  resolveShortUrl,
  type CodeGenerator,
  type CreateShortUrlInput,
  type ResolveShortUrlInput,
  type ShortUrl,
} from "@url-shortener/engine";
import { prisma } from "./db.server";
import { PrismaShortUrlRepository } from "./repositories/prisma-short-url-repository.server";

class RandomCodeGenerator implements CodeGenerator {
  private static readonly alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  generate(): string {
    let code = "";

    for (let index = 0; index < 8; index++) {
      code += RandomCodeGenerator.alphabet[
        randomInt(RandomCodeGenerator.alphabet.length)
      ];
    }

    return code;
  }
}

const shortUrlRepository = new PrismaShortUrlRepository(prisma);
const codeGenerator = new RandomCodeGenerator();

export function createShortUrlForRequest(
  input: CreateShortUrlInput,
): Promise<ShortUrl> {
  return createShortUrl(input, {
    repository: shortUrlRepository,
    codeGenerator,
  });
}

export function resolveShortUrlForRequest(
  input: ResolveShortUrlInput,
): Promise<ShortUrl> {
  return resolveShortUrl(input, {
    repository: shortUrlRepository,
  });
}

export function listShortUrlsForRequest(): Promise<ShortUrl[]> {
  return listShortUrls({
    repository: shortUrlRepository,
  });
}
