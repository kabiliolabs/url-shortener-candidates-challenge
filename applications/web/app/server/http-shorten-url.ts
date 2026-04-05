import {
  buildShortenedUrlPrefix,
  createShortenedUrl,
  findShortenedUrl,
  generateShortCode,
  isCodeGenerationExhaustedError,
  recordClick,
} from "@url-shortener/engine";
import { shortenedUrlRepository } from "@url-shortener/engine/server";

export type ShortenUrlActionResult =
  | { error: string }
  | { shortenedUrl: string };

function getSubmittedUrl(formData: FormData): string | null {
  const url = formData.get("url");
  return typeof url === "string" && url ? url : null;
}

export function getShortenedUrlPrefixFromEnv(): string {
  return buildShortenedUrlPrefix(process.env.PUBLIC_URL);
}

export async function handleShortenUrlAction(
  request: Request,
): Promise<ShortenUrlActionResult> {
  const formData = await request.formData();
  const url = getSubmittedUrl(formData);

  if (!url) {
    return { error: "URL is required" };
  }

  const currentBaseUrl = process.env.PUBLIC_URL;
  if (!currentBaseUrl) {
    return { error: "PUBLIC_URL is required" };
  }

  try {
    return await createShortenedUrl(url, {
      currentBaseUrl,
      createCode: generateShortCode,
      repository: shortenedUrlRepository,
    });
  } catch (error) {
    if (isCodeGenerationExhaustedError(error)) {
      return { error: "Unable to shorten this URL right now. Please try again." };
    }
    throw error;
  }
}

export function findShortenedUrlByCode(
  code: string | undefined,
): Promise<string | null> {
  return findShortenedUrl(code, shortenedUrlRepository);
}

export function recordClickByCode(code: string): Promise<void> {
  return recordClick(code, shortenedUrlRepository);
}
