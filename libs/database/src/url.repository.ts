import type { UrlRecord } from "./url.types.js";

export type CreateUrlData = {
  url: string;
  shortCode: string;
};

export type UrlRepository = {
  findByUrl: (url: string) => Promise<UrlRecord | null>;
  findByShortCode: (shortCode: string) => Promise<UrlRecord | null>;
  findAll: () => Promise<UrlRecord[]>;
  create: (data: CreateUrlData) => Promise<UrlRecord>;
  incrementShortenCount: (id: number) => Promise<UrlRecord>;
  incrementClickCount: (id: number) => Promise<void>;
};
