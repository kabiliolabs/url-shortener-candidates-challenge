import type { ShortenedUrl } from "../models/shortened-url.js";

export function serializeShortenedUrl(url: ShortenedUrl, publicUrl: string) {
  return {
    ...url,
    shortUrl: `${publicUrl}/s/${url.code}`,
  };
}
