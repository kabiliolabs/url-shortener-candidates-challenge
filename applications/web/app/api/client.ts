import type { ApiError, ListUrlsResponse, ShortenResponse } from "./types.js";
import { isApiErrorResponse } from "./types.js";

const API_BASE = "";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = isApiErrorResponse(data) ? data.error : `Request failed: ${res.status}`;
    const err: ApiError = new Error(msg) as ApiError;
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export async function shortenUrl(url: string): Promise<ShortenResponse> {
  const body = { url: String(url).trim() };
  if (!body.url) {
    throw new Error("URL is required");
  }
  return request<ShortenResponse>("/api/shorten", {
    method: "POST",
    body,
  });
}

export async function listUrls(): Promise<ListUrlsResponse> {
  return request<ListUrlsResponse>("/api/urls");
}
