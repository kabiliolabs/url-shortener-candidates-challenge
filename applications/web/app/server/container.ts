import {
  RandomShortCodeGenerator,
  ShortenUrlUseCase,
  ResolveUrlUseCase,
} from "@url-shortener/engine";
import { PrismaUrlRepository } from "./repositories/prisma-url-repository";

const repository = new PrismaUrlRepository();
const generator = new RandomShortCodeGenerator();

export const shortenUrl = new ShortenUrlUseCase(repository, generator);
export const resolveUrl = new ResolveUrlUseCase(repository);
