import { OriginalUrl } from "../domain/value-objects/original-url";
import { DuplicateCodeError } from "../domain/errors";
import type { ShortUrlRepository } from "../domain/ports/short-url-repository";
import type { CodeGenerator } from "../domain/ports/code-generator";
import type { ShortenedUrl } from "../domain/shortened-url";

const DEFAULT_MAX_ATTEMPTS = 5;

export type CreateShortUrlDeps = {
  repository: ShortUrlRepository;
  codeGenerator: CodeGenerator;
  /** Max retries when a generated code collides. Defaults to 5. */
  maxAttempts?: number;
};

export type CreateShortUrlInput = {
  url: string;
};

export type CreateShortUrl = (
  input: CreateShortUrlInput,
) => Promise<ShortenedUrl>;

// On a code collision (DuplicateCodeError from storage), retry with a fresh
// code up to maxAttempts. Retry lives here, not in the repository, so storage
// and code generation stay decoupled.
export function createShortUrlUseCase({
  repository,
  codeGenerator,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
}: CreateShortUrlDeps): CreateShortUrl {
  return async ({ url }) => {
    const originalUrl = OriginalUrl.create(url);

    let lastError: DuplicateCodeError | undefined;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const code = codeGenerator.generate();
      try {
        return await repository.save({ code, originalUrl: originalUrl.value });
      } catch (error) {
        if (error instanceof DuplicateCodeError) {
          lastError = error;
          continue;
        }
        throw error;
      }
    }

    throw lastError ?? new Error("Failed to generate a unique short code");
  };
}
