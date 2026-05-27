import { getPublicUrl } from "./config.server";

type CreateRateLimitBucket = {
  count: number;
  resetAt: number;
};

export type ShortUrlRequestErrorCode =
  | "rate_limited"
  | "self_referential_url";

export class ShortUrlRequestError extends Error {
  constructor(
    readonly code: ShortUrlRequestErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ShortUrlRequestError";
  }
}

const CREATE_RATE_LIMIT_WINDOW_MS = 60_000;
const CREATE_RATE_LIMIT_MAX_REQUESTS = 20;
const createRateLimitBuckets = new Map<string, CreateRateLimitBucket>();

export function assertCreateShortUrlRequestIsAllowed(request: Request): void {
  const clientId = getClientId(request);
  const now = Date.now();
  const bucket = createRateLimitBuckets.get(clientId);

  if (!bucket || bucket.resetAt <= now) {
    createRateLimitBuckets.set(clientId, {
      count: 1,
      resetAt: now + CREATE_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (bucket.count >= CREATE_RATE_LIMIT_MAX_REQUESTS) {
    throw new ShortUrlRequestError(
      "rate_limited",
      "Too many URLs created. Please wait a moment and try again.",
    );
  }

  bucket.count += 1;
}

export function assertUrlDoesNotPointToShortener(value: string): void {
  let originalUrl: URL;
  let publicUrl: URL;

  try {
    originalUrl = new URL(value.trim());
    publicUrl = new URL(getPublicUrl());
  } catch {
    return;
  }

  if (
    originalUrl.origin !== publicUrl.origin ||
    !isShortUrlRoutePath(originalUrl.pathname)
  ) {
    return;
  }

  throw new ShortUrlRequestError(
    "self_referential_url",
    "Shortening existing short URLs is not allowed.",
  );
}

function isShortUrlRoutePath(pathname: string): boolean {
  const decodedPathname = decodePathname(pathname);

  return decodedPathname === "/s" || decodedPathname.startsWith("/s/");
}

function decodePathname(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

function getClientId(request: Request): string {
  return (
    getForwardedIp(request) ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown-client"
  );
}

function getForwardedIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (!forwardedFor) {
    return null;
  }

  return forwardedFor.split(",")[0]?.trim() || null;
}
