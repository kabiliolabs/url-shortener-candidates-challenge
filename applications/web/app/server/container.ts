import {
  RandomShortCodeGenerator,
  ShortenUrlUseCase,
  ResolveUrlUseCase,
  ShortCode,
} from "@url-shortener/engine";
import { PrismaUrlRepository } from "./repositories/prisma-url-repository";

const repository = new PrismaUrlRepository();
const generator = new RandomShortCodeGenerator();

export const shortenUrl = new ShortenUrlUseCase(repository, generator);
export const resolveUrl = new ResolveUrlUseCase(repository);

export const listUrls = () => repository.findAll();

export const incrementClicks = async (code: string): Promise<void> => {
  try {
    await repository.incrementClicks(new ShortCode(code));
  } catch {
    // never let tracking errors break a redirect
  }
};
