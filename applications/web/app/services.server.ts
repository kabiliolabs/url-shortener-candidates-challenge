// Composition root: the only place that reads configuration and decides which
// implementations the use cases get. Routes import from here and nowhere else.
import {
  ListShortUrls,
  PrismaShortUrlRepository,
  RandomCodeGenerator,
  ResolveShortUrl,
  ShortenUrl,
} from "@url-shortener/engine";
import { prisma } from "./lib/prisma.server";

// Evaluated when the server loads its routes, so a missing or malformed value
// stops the app at startup instead of producing broken short URLs later.
function readPublicOrigin(): string {
  const value = process.env.PUBLIC_URL;
  if (!value) {
    throw new Error("PUBLIC_URL is not set. See .env.example.");
  }
  if (!URL.canParse(value)) {
    throw new Error(`PUBLIC_URL is not a valid URL: "${value}"`);
  }
  // Only the origin is used, so a trailing slash or a path in the variable
  // cannot produce malformed short URLs.
  return new URL(value).origin;
}

const publicOrigin = readPublicOrigin();
const repository = new PrismaShortUrlRepository(prisma);

export const shortenUrl = new ShortenUrl(
  repository,
  new RandomCodeGenerator(),
  // Our own host is blocked so nobody can shorten one of our short URLs.
  [new URL(publicOrigin).host],
);
export const resolveShortUrl = new ResolveShortUrl(repository);
export const listShortUrls = new ListShortUrls(repository);

/** What every short URL starts with. Shown to people before they create one. */
export const shortUrlBase = `${publicOrigin}/s/`;

export function shortUrlFor(code: string): string {
  return shortUrlBase + code;
}
