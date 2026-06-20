import { UrlShortener, type UrlRepository } from "@url-shortener/engine";
import { PrismaUrlRepository } from "./url-repository.prisma";

// Composition root: the single place where concrete implementations are wired
// together. Everything else depends on abstractions (the engine's port), so
// swapping the repository or tweaking config happens only here.
const repository: UrlRepository = new PrismaUrlRepository();
const shortener = new UrlShortener(repository, { codeLength: 7, maxRetries: 5 });

/** The shared repository instance (reads/writes for routes that need raw access). */
export function getUrlRepository(): UrlRepository {
  return repository;
}

/** The shared shortener service (validation + code generation + persistence). */
export function getUrlShortener(): UrlShortener {
  return shortener;
}

/** Public origin used to build absolute short URLs, without a trailing slash. */
export function getPublicBaseUrl(): string {
  return (process.env.PUBLIC_URL ?? "http://localhost:5173").replace(/\/$/, "");
}

/** Builds the full short URL shown to and shared by the user. */
export function buildShortUrl(code: string): string {
  return `${getPublicBaseUrl()}/s/${code}`;
}
