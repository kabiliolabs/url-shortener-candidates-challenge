export type ShortenedUrlDto = {
  id: string;
  code: string;
  url: string;
  createdAt: string;
  clickCount: number;
};

export type ShortenResponse =
  | { shortenedUrl: string; error?: never }
  | { shortenedUrl?: never; error: string };

export type ListUrlsResponse = {
  urls: ShortenedUrlDto[];
};
