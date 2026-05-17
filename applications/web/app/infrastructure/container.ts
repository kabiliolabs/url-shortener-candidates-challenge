import { ShortenUrlUseCase, TrackClickUseCase, ListUrlsUseCase } from "@url-shortener/engine";
import { PrismaUrlRepository } from "./prisma-url-repository";
import { shortenRateLimiter } from "./shorten-rate-limiter";

export function makeShortenUrlUseCase(): ShortenUrlUseCase {
  return new ShortenUrlUseCase(new PrismaUrlRepository(), shortenRateLimiter);
}

export function makeTrackClickUseCase(): TrackClickUseCase {
  return new TrackClickUseCase(new PrismaUrlRepository());
}

export function makeListUrlsUseCase(): ListUrlsUseCase {
  return new ListUrlsUseCase(new PrismaUrlRepository());
}
