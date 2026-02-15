/**
 * Frontend-only types for API client and UI. Do not import in backend (services, server types, api route handlers).
 */

export interface ShortenedUrlDto {
  id: string;
  code: string;
  url: string;
  createdAt: string;
  clickCount: number;
}

export type ShortenResponse =
  | { shortenedUrl: string; error?: never }
  | { shortenedUrl?: never; error: string };

export interface ListUrlsResponse {
  urls: ShortenedUrlDto[];
}

/** Error thrown by API client with optional HTTP status. */
export interface ApiError extends Error {
  status?: number;
}
