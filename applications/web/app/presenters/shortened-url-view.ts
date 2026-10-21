import type { ShortenedUrl } from "@url-shortener/engine";

/**
 * View model. Domain objects never cross the network boundary: loaders return
 * plain, serialisable data, which keeps the client free of domain classes and
 * the serialisation contract explicit.
 */
export interface ShortenedUrlView {
  code: string;
  shortUrl: string;
  destination: string;
  clicks: number;
  createdAt: string;
  lastVisitedAt: string | null;
}

export function toView(shortenedUrl: ShortenedUrl, baseUrl: string): ShortenedUrlView {
  return {
    code: shortenedUrl.code.value,
    shortUrl: shortenedUrl.shortUrl(baseUrl),
    destination: shortenedUrl.destination.value,
    clicks: shortenedUrl.clicks,
    createdAt: shortenedUrl.createdAt.toISOString(),
    lastVisitedAt: shortenedUrl.lastVisitedAt?.toISOString() ?? null,
  };
}
