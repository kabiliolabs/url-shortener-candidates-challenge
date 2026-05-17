import { ShortenedUrl } from "./shortened-url";

export interface UrlSavePort {
  save(url: ShortenedUrl): Promise<void>;
  findByOriginalUrl(originalUrl: string): Promise<ShortenedUrl | null>;
}

export interface UrlClickPort {
  incrementClicks(code: string): Promise<ShortenedUrl | null>;
}

export interface UrlLookupPort {
  findByCode(code: string): Promise<ShortenedUrl | null>;
}

export interface UrlListPort {
  findAll(): Promise<ShortenedUrl[]>;
}

export interface UrlRepository extends UrlSavePort, UrlClickPort, UrlLookupPort, UrlListPort {}
