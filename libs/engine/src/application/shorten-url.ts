import { CodeGenerationFailed, ShortCodeAlreadyExists } from "../domain/errors";
import type { ShortCodeGenerator } from "../domain/short-code-generator";
import type { ShortUrl } from "../domain/short-url";
import type { ShortUrlRepository } from "../domain/short-url-repository";

// A collision with random codes is already unlikely, so several in a row point
// to a real problem (exhausted code space, broken generator). Failing loudly is
// better than looping.
const MAX_ATTEMPTS = 5;

export class ShortenUrl {
  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly codes: ShortCodeGenerator,
  ) {}

  async execute(originalUrl: string): Promise<ShortUrl> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        return await this.repository.create(this.codes.generate(), originalUrl);
      } catch (error) {
        if (!(error instanceof ShortCodeAlreadyExists)) throw error;
      }
    }
    throw new CodeGenerationFailed(MAX_ATTEMPTS);
  }
}
