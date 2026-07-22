const apiUrl = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");

export class ApiError extends Error {}

export interface CreatedShortUrl {
  code: string;
  shortUrl: string;
}

export async function createShortUrl(url: string): Promise<CreatedShortUrl> {
  const response = await fetch(`${apiUrl}/urls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const body = await readResponse(response);
  return body as CreatedShortUrl;
}

export async function resolveShortUrl(code: string): Promise<{ url: string }> {
  const response = await fetch(`${apiUrl}/urls/${encodeURIComponent(code)}`);
  return readResponse(response) as Promise<{ url: string }>;
}

async function readResponse(response: Response): Promise<unknown> {
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new ApiError(body.error ?? "The URL service is currently unavailable");
  }
  return body;
}
