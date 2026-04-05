import { baseUrl, generateShortCode } from "@url-shortener/engine";
import type { ShortenedUrlRepository } from "~/domain/repositories/shortened-url.repository";
import {
  CodeGenerationExhaustedError,
  isCodeGenerationExhaustedError,
} from "~/domain/errors/code-generation-exhausted.error";
import { isDuplicateCodeError } from "~/domain/errors/duplicate-code.error";
import { shortenedUrlRepository } from "~/infrastructure/prisma-shortened-url.repository.server";

export type ShortenUrlActionResult =
  | { error: string }
  | { shortenedUrl: string };

export const MAX_CODE_GENERATION_ATTEMPTS = 5;

type ShortenUrlDependencies = {
  currentBaseUrl: string | undefined;
  createCode: () => string;
  repository: ShortenedUrlRepository;
};

const defaultDependencies: ShortenUrlDependencies = {
  currentBaseUrl: baseUrl,
  createCode: generateShortCode,
  repository: shortenedUrlRepository,
};

export function buildShortenedUrlPrefix(
  currentBaseUrl: string | undefined,
): string {
  return currentBaseUrl ? `${currentBaseUrl}/s/` : "-";
}

export function getSubmittedUrl(formData: FormData): string | null {
  const url = formData.get("url");

  return typeof url === "string" && url ? url : null;
}

export async function createShortenedUrl(
  url: string,
  { currentBaseUrl, createCode, repository }: ShortenUrlDependencies,
): Promise<{ shortenedUrl: string }> {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const shortCode = createCode();

    try {
      await repository.create({ code: shortCode, originalUrl: url });

      return {
        shortenedUrl: `${currentBaseUrl}/s/${shortCode}`,
      };
    } catch (error) {
      if (!isDuplicateCodeError(error)) {
        throw error;
      }
    }
  }

  throw new CodeGenerationExhaustedError(MAX_CODE_GENERATION_ATTEMPTS);
}

export async function handleShortenUrlAction(
  request: Request,
  dependencies: ShortenUrlDependencies = defaultDependencies,
): Promise<ShortenUrlActionResult> {
  const formData = await request.formData();
  const url = getSubmittedUrl(formData);

  if (!url) {
    return { error: "URL is required" };
  }

  try {
    return await createShortenedUrl(url, dependencies);
  } catch (error) {
    if (isCodeGenerationExhaustedError(error)) {
      return { error: "Unable to shorten this URL right now. Please try again." };
    }
    throw error;
  }
}

export async function findShortenedUrl(
  code: string | undefined,
  repository: ShortenedUrlRepository = shortenedUrlRepository,
): Promise<string | null> {
  if (!code) {
    return null;
  }

  const record = await repository.findByCode(code);
  return record?.originalUrl ?? null;
}

export async function recordClick(
  code: string,
  repository: ShortenedUrlRepository = shortenedUrlRepository,
): Promise<void> {
  await repository.incrementClicks(code);
}
