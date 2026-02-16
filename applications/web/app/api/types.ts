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

/** JSON body shape when the API returns an error (e.g. 4xx/5xx). */
export interface ApiErrorResponse {
  error: string;
}

/** Type guard: true when value is an object with a string 'error' property. */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorResponse).error === "string"
  );
}

/** Error thrown by API client with optional HTTP status. */
export interface ApiError extends Error {
  status?: number;
}
