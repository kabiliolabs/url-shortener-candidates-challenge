import type { ShortenResponse, ListUrlsResponse } from "./types.js";

const API_BASE = "";

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    method,
    headers:
      body !== undefined
        ? { "Content-Type": "application/json", ...rest.headers }
        : rest.headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    const msg = data && typeof data === "object" && "error" in data && typeof (data as { error: string }).error === "string"
      ? (data as { error: string }).error
      : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export async function shortenUrl(url: string): Promise<ShortenResponse> {
  return request<ShortenResponse>("/api/shorten", {
    method: "POST",
    body: { url },
  });
}

export async function listUrls(): Promise<ListUrlsResponse> {
  return request<ListUrlsResponse>("/api/urls");
}
