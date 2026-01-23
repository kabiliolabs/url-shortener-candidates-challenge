import { urlShortenerService, type ShortenedUrlResult } from "../services/url-shortener.service";

export interface HomeLoaderData {
  baseUrl: string;
  recentUrls: ShortenedUrlResult[];
}

export async function homeLoader(): Promise<HomeLoaderData> {
  const allUrls = await urlShortenerService.getAllUrls();
  const recentUrls = allUrls.slice(0, 5); // Get last 5 URLs

  return {
    baseUrl: urlShortenerService.getBaseUrl(),
    recentUrls,
  };
}
