import { FollowShortUrl, ListShortUrls, ShortenUrl } from "@url-shortener/engine";
import { config } from "./config";
import { prisma } from "./persistence/prisma-client";
import { PrismaShortUrlRepository } from "./persistence/prisma-short-url-repository";

const shortUrlRepository = new PrismaShortUrlRepository(prisma);

export const shortenUrl = new ShortenUrl(shortUrlRepository, config.publicUrl);
export const followShortUrl = new FollowShortUrl(
  shortUrlRepository,
  (error, shortCode) => console.error(`Failed to record click for ${shortCode}`, error),
);
export const listShortUrls = new ListShortUrls(shortUrlRepository);
