import { PostgresDatabase } from "@url-shortener/database";
import {
  ResolveShortenedURLUseCase,
  ShortenURLUseCase,
} from "@url-shortener/engine";

import {
  NanoIDShortCodeGenerator,
  PostgresShortenerRepository,
  shortenerSchema,
} from "@url-shortener/engine/infrastructure";
import { readDatabaseConfig } from "../database/config";

export type ApplicationDependencies = {
  shortenURL: ShortenURLUseCase;
  resolveShortenedURL: ResolveShortenedURLUseCase;
  close: () => Promise<void>;
};

export function bootstrapApplication(): ApplicationDependencies {
  const database = new PostgresDatabase(readDatabaseConfig(), shortenerSchema);
  const postgresShortenerRepository = new PostgresShortenerRepository(
    database.db,
  );

  const generator = new NanoIDShortCodeGenerator();
  const shortenURL = new ShortenURLUseCase(
    generator,
    postgresShortenerRepository,
  );
  const resolveShortenedURL = new ResolveShortenedURLUseCase(
    postgresShortenerRepository,
  );

  return {
    shortenURL,
    resolveShortenedURL,
    close: (): Promise<void> => database.close(),
  };
}

export const { shortenURL, resolveShortenedURL, close } =
  bootstrapApplication();
