import {
  InMemoryUrlRepository,
  RandomShortCodeGenerator,
  ShortenUrlUseCase,
  ResolveUrlUseCase,
} from "@url-shortener/engine";

const repository = new InMemoryUrlRepository();
const generator = new RandomShortCodeGenerator();

export const shortenUrl = new ShortenUrlUseCase(repository, generator);
export const resolveUrl = new ResolveUrlUseCase(repository);
