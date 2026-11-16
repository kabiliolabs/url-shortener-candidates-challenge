// Composition root: the only place that reads configuration and decides which
// implementations the use cases get. Routes import from here and nowhere else.
import {
  InMemoryRateLimiter,
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

// Rate limiting is wired here and called by the route, not by a use case:
// deciding who the client is and when to refuse them is an HTTP concern.
export const creationRateLimiter = new InMemoryRateLimiter({
  limit: 10,
  windowMs: 60_000,
});

const trustProxy = process.env.TRUST_PROXY === "true";

// The server adapter does not expose the socket address to loaders and actions,
// so the only source for the client's IP is the header a proxy adds.
const UNIDENTIFIED_CLIENT = "global";

/**
 * The key that rate limits are counted against.
 *
 * `x-forwarded-for` is only read when TRUST_PROXY=true, and then only its LAST
 * value: that is the one our single trusted proxy appends. Earlier values are
 * whatever the client sent and can be forged to dodge the limit. Without a
 * trusted proxy nothing in the request identifies the client reliably, so
 * everyone shares one key: stricter, but it cannot be bypassed.
 */
export function clientKeyFor(request: Request): string {
  if (!trustProxy) return UNIDENTIFIED_CLIENT;
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",").at(-1)?.trim() || UNIDENTIFIED_CLIENT;
}

/** What every short URL starts with. Shown to people before they create one. */
export const shortUrlBase = `${publicOrigin}/s/`;

export function shortUrlFor(code: string): string {
  return shortUrlBase + code;
}
