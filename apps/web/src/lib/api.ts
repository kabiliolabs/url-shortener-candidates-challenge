type ShortenResponse = {
  shortUrl?: string;
  error?: string;
  code?: string;
  field?: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export async function shortenUrl(url: string): Promise<string> {
  const response = await fetch(`${apiUrl}/shorten`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = await response.json() as ShortenResponse;

  if (!response.ok || !data.shortUrl) {
    throw new Error(data.error ?? "Could not shorten this URL.");
  }

  return data.shortUrl;
}
