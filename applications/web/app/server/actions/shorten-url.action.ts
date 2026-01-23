import { urlShortenerService } from "../services/url-shortener.service";

export interface ShortenUrlActionResult {
  shortCode?: string;
  shortenedUrl?: string;
  originalUrl?: string;
  error?: string;
}

export async function shortenUrlAction({
  request,
}: {
  request: Request;
}): Promise<ShortenUrlActionResult> {
  const formData = await request.formData();
  const url = formData.get("url") as string;

  if (!url) {
    return { error: "URL is required" };
  }

  const result = await urlShortenerService.shortenUrl(url);

  return {
    shortCode: result.shortCode,
    shortenedUrl: result.shortenedUrl,
    originalUrl: result.originalUrl,
  };
}
