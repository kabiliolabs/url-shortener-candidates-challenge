import type { ShortenedUrlListItem } from "../../lib/api.server";

export interface HomeLoaderData {
  baseUrl: string;
  recentUrls: ShortenedUrlListItem[];
  recentUrlsError: string | null;
}

export interface HomeActionData {
  error: string | null;
  shortenedUrl: string | null;
  submittedUrl: string;
}

export interface HomePageState {
  hero: {
    title: string;
    description: string;
  };
  summary: {
    baseUrl: string;
    recentUrlCount: number;
    trackedClicks: number;
  };
  form: {
    baseUrl: string;
    inputValue: string;
    isSubmitting: boolean;
    error: string | null;
    helperText: string;
  };
  result: {
    shortenedUrl: string | null;
    fallbackShortUrl: string | null;
  };
  recentUrls: {
    items: ShortenedUrlListItem[];
    error: string | null;
  };
}