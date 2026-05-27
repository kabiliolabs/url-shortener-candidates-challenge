import { createShortCode } from "../domain/short-code";
import type { ShortUrl } from "../domain/short-url";
import { createOriginalUrl } from "../domain/url";
import { ShortUrlError } from "../errors";
import type { CodeGenerator } from "../ports/code-generator";
import type { ShortUrlRepository } from "../ports/short-url-repository";

const MAX_CODE_GENERATION_ATTEMPTS = 10;

export interface CreateShortUrlInput {
  originalUrl: string;
}

export interface CreateShortUrlDependencies {
  repository: ShortUrlRepository;
  codeGenerator: CodeGenerator;
  now?: () => Date;
}

export async function createShortUrl(
  input: CreateShortUrlInput,
  dependencies: CreateShortUrlDependencies,
): Promise<ShortUrl> {
  const originalUrl = createOriginalUrl(input.originalUrl);

  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
    const code = createShortCode(dependencies.codeGenerator.generate());
    const existingShortUrl = await dependencies.repository.findByCode(code);

    if (existingShortUrl) {
      continue;
    }

    const now = dependencies.now?.() ?? new Date();
    const shortUrl: ShortUrl = {
      code,
      originalUrl,
      clickCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await dependencies.repository.save(shortUrl);

    return shortUrl;
  }

  throw new ShortUrlError(
    "code_generation_failed",
    "Could not generate a unique short code",
  );
}
