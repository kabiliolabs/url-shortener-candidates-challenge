export interface ApiError {
  code: string;
  message: string;
  retryAfterSeconds?: number;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export interface UrlStats {
  code: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

export interface UrlListPage {
  urls: UrlStats[];
  limit: number;
  offset: number;
  nextOffset: number | null;
}

export const NETWORK_ERROR: ApiError = {
  code: "NETWORK_ERROR",
  message: "Network request failed",
};

/** Maps a backend or transport error to a message fit to show the user. */
export function describeError(error: ApiError): string {
  switch (error.code) {
    case "INVALID_URL":
      // Validation messages are written for users by the domain rule.
      return error.message;
    case "RATE_LIMITED":
      return error.retryAfterSeconds
        ? `You're creating links too quickly. Try again in ${error.retryAfterSeconds} seconds.`
        : "You're creating links too quickly. Please wait a moment and try again.";
    case "PAYLOAD_TOO_LARGE":
      return "That URL is too long to shorten.";
    case "NETWORK_ERROR":
      return "Can't reach the server. Check your connection and try again.";
    default:
      return "Something went wrong on our side. Please try again.";
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const retryAfterSeconds = Number(response.headers.get("Retry-After"));

  return {
    code: body?.error?.code ?? "UNKNOWN",
    message: body?.error?.message ?? response.statusText,
    ...(retryAfterSeconds > 0 && { retryAfterSeconds }),
  };
}

export async function fetchUrlList(
  signal?: AbortSignal,
  fetchImpl: typeof fetch = fetch,
): Promise<ApiResult<UrlListPage>> {
  let response: Response;
  try {
    response = await fetchImpl("/api/urls", {
      signal,
      headers: { Accept: "application/json" },
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }

  if (!response.ok) {
    return { ok: false, error: await toApiError(response) };
  }

  return { ok: true, data: (await response.json()) as UrlListPage };
}
