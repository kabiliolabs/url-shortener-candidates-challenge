import { createShortUrlService } from "@url-shortener/engine";

/** Single ShortUrlService instance for this server process (one PrismaClient). */
export const shortUrlService = createShortUrlService();
