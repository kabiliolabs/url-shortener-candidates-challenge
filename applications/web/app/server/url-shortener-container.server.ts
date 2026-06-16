import {
  CreateShortUrlUseCase,
  GetUrlStatsUseCase,
  NanoIdShortCodeGenerator,
  RedirectToOriginalUrlUseCase,
  TrackClickUseCase,
} from "@url-shortener/engine";
import { prisma } from "./prisma.server";
import { PrismaShortUrlRepository } from "~/features/url-shortener/server/prisma-short-url-repository.server";
import { FixedWindowRateLimiter } from "~/features/url-shortener/server/rate-limiter.server";

const repository = new PrismaShortUrlRepository(prisma);
const generator = new NanoIdShortCodeGenerator();

export const urlShortenerContainer = {
  rateLimiter: new FixedWindowRateLimiter(20, 60_000),
  createShortUrlUseCase: new CreateShortUrlUseCase(repository, generator),
  redirectToOriginalUrlUseCase: new RedirectToOriginalUrlUseCase(repository),
  trackClickUseCase: new TrackClickUseCase(repository),
  getUrlStatsUseCase: new GetUrlStatsUseCase(repository),
};
