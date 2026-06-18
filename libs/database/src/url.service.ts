import { generateShortCode } from "@url-shortener/engine";
import { defaultUrlRepository } from "./prisma-url.repository.js";
import type { UrlRecord } from "./url.types.js";

export async function createUrl(fullUrl: string): Promise<UrlRecord> {
  const existingUrl = await defaultUrlRepository.findByUrl(fullUrl);

  if (existingUrl) {
    return defaultUrlRepository.incrementShortenCount(existingUrl.id);
  }

  const shortCode = generateShortCode();
  return defaultUrlRepository.create({ url: fullUrl, shortCode });
}

export async function getAllUrls(): Promise<UrlRecord[]> {
  return defaultUrlRepository.findAll();
}

export async function resolveShortCode(
  shortCode: string,
): Promise<string | null> {
  const record = await defaultUrlRepository.findByShortCode(shortCode);

  if (!record) {
    return null;
  }

  await defaultUrlRepository.incrementClickCount(record.id);
  return record.url;
}
