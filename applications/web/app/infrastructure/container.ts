import { ShortenUrlUseCase, TrackClickUseCase, ListUrlsUseCase } from "@url-shortener/engine";
import { PrismaUrlRepository } from "./prisma-url-repository";
import { shortenRateLimiter } from "./shorten-rate-limiter";

const repository = new PrismaUrlRepository();

export function makeShortenUrlUseCase(): ShortenUrlUseCase {
  return new ShortenUrlUseCase(repository, shortenRateLimiter);
}

export function makeTrackClickUseCase(): TrackClickUseCase {
  return new TrackClickUseCase(repository);
}

export function makeListUrlsUseCase(): ListUrlsUseCase {
  return new ListUrlsUseCase(repository);
}
