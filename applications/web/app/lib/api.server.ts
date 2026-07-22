const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface CreatedShortUrl {
  code: string;
  shortUrl: string;
}

export interface ShortenedUrlListItem extends CreatedShortUrl {
  url: string;
  createdAt: string;
  clicks: number;
}

export async function createShortUrl(url: string): Promise<CreatedShortUrl> {
  return requestJson<CreatedShortUrl>("/urls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  }, "Unable to shorten this URL right now.");
}

export async function resolveShortUrl(code: string): Promise<{ url: string }> {
  return requestJson<{ url: string }>(
    `/urls/${encodeURIComponent(code)}`,
    undefined,
    "Unable to resolve this short URL right now.",
  );
}

export async function listShortUrls(limit = 10): Promise<ShortenedUrlListItem[]> {
  const response = await requestJson<{ urls: ShortenedUrlListItem[] }>(
    `/urls?limit=${encodeURIComponent(String(limit))}`,
    undefined,
    "Unable to load recent shortened URLs right now.",
  );
  return response.urls;
}

async function requestJson<T>(
  path: string,
  init: RequestInit | undefined,
  fallbackMessage: string,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${apiUrl}${path}`, init);
  } catch {
    throw new ApiError(
      "Unable to reach the URL service. Check whether the API is running and try again.",
      503,
    );
  }

  return readResponse<T>(response, fallbackMessage);
}

async function readResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(body.error ?? messageForStatus(response.status, fallbackMessage), response.status);
  }
  return body as T;
}

function messageForStatus(status: number, fallbackMessage: string): string {
  if (status === 400) {
    return "Please provide a valid URL before submitting.";
  }

  if (status === 404) {
    return "Short URL not found.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  if (status >= 500) {
    return "The URL service is temporarily unavailable. Please try again shortly.";
  }

  return fallbackMessage;
}
