import { FollowShortUrl, ShortenUrl } from "@url-shortener/engine";
import { config } from "./config";
import { prisma } from "./persistence/prisma-client";
import { PrismaShortUrlRepository } from "./persistence/prisma-short-url-repository";

const shortUrlRepository = new PrismaShortUrlRepository(prisma);

export const shortenUrl = new ShortenUrl(shortUrlRepository, config.publicUrl);
export const followShortUrl = new FollowShortUrl(shortUrlRepository);
