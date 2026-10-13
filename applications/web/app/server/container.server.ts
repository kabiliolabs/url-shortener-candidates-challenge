import {
  CreateShortUrl,
  DeleteShortUrl,
  ListClickEvents,
  ListShortUrls,
  ResolveShortUrl,
} from "@url-shortener/engine";
import { CryptoShortCodeGenerator } from "../infrastructure/crypto-short-code-generator.server";
import { prisma } from "../infrastructure/prisma.server";
import { PrismaUrlRepository } from "../infrastructure/prisma-url-repository.server";
import { SystemClock } from "../infrastructure/system-clock.server";

const repository = new PrismaUrlRepository(prisma);
const codeGenerator = new CryptoShortCodeGenerator();
const clock = new SystemClock();

export const services = {
  createShortUrl: new CreateShortUrl(repository, codeGenerator, clock),
  deleteShortUrl: new DeleteShortUrl(repository),
  listClickEvents: new ListClickEvents(repository),
  listShortUrls: new ListShortUrls(repository),
  resolveShortUrl: new ResolveShortUrl(repository),
};
