import {
  CodeGenerationExhaustedError,
  isDuplicateCodeError,
} from "../../domain/errors";
import type { ShortenedUrlRepository } from "../repositories/shortened-url-repository";

export const MAX_CODE_GENERATION_ATTEMPTS = 5;

export type CreateShortenedUrlDependencies = {
  currentBaseUrl: string;
  createCode: () => string;
  repository: ShortenedUrlRepository;
};

export function buildShortenedUrlPrefix(currentBaseUrl: string | undefined): string {
  return currentBaseUrl ? `${currentBaseUrl}/s/` : "-";
}

export async function createShortenedUrl(
  url: string,
  { currentBaseUrl, createCode, repository }: CreateShortenedUrlDependencies,
): Promise<{ shortenedUrl: string }> {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const shortCode = createCode();

    try {
      await repository.create({ code: shortCode, originalUrl: url });
      return { shortenedUrl: `${currentBaseUrl}/s/${shortCode}` };
    } catch (error) {
      if (!isDuplicateCodeError(error)) {
        throw error;
      }
    }
  }

  throw new CodeGenerationExhaustedError(MAX_CODE_GENERATION_ATTEMPTS);
}

export async function findShortenedUrl(
  code: string | undefined,
  repository: ShortenedUrlRepository,
): Promise<string | null> {
  if (!code) {
    return null;
  }

  const record = await repository.findByCode(code);
  return record?.originalUrl ?? null;
}

export async function recordClick(
  code: string,
  repository: ShortenedUrlRepository,
): Promise<void> {
  await repository.incrementClicks(code);
}
