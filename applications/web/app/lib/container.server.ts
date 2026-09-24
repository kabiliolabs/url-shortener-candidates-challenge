import { mkdirSync } from "node:fs";
import path from "node:path";
import {
  Base62CodeGenerator,
  PrismaUrlRepository,
  UrlShortenerService,
  createPrismaClient,
} from "@url-shortener/engine";

const DEFAULT_DATABASE_URL = "file:../../data/app.db";

function createService(): UrlShortenerService {
  const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;

  // SQLite creates the file but not its folder.
  mkdirSync(path.dirname(path.resolve(databaseUrl.replace(/^file:/, ""))), {
    recursive: true,
  });

  return new UrlShortenerService(
    new PrismaUrlRepository(createPrismaClient(databaseUrl)),
    new Base62CodeGenerator(),
  );
}

// Reuse one instance across dev hot reloads instead of opening a new connection each time.
const globalForContainer = globalThis as unknown as {
  urlShortener?: UrlShortenerService;
};
export const urlShortener = (globalForContainer.urlShortener ??= createService());

export function getPublicUrl(): string {
  return (process.env.PUBLIC_URL ?? "http://localhost:5173").replace(/\/+$/, "");
}