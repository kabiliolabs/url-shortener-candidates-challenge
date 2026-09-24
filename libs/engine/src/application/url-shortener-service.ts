import { CodeAlreadyExistsError, CodeGenerationError, UrlNotFoundError } from "../domain/errors";
import type { ShortCodeGenerator } from "../domain/short-code-generator";
import type { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";
import { validateUrl } from "./validate-url";

const MAX_CODE_ATTEMPTS = 5;

export class UrlShortenerService {
  private readonly repository: UrlRepository;
  private readonly generator: ShortCodeGenerator;

  constructor(repository: UrlRepository, generator: ShortCodeGenerator) {
    this.repository = repository;
    this.generator = generator;
  }

  async shorten(rawUrl: unknown): Promise<ShortUrl> {
    const originalUrl = validateUrl(rawUrl);

    // The unique constraint is the source of truth: on a collision, retry with a new code.
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      try {
        return await this.repository.create({
          code: this.generator.generate(),
          originalUrl,
        });
      } catch (error) {
        if (!(error instanceof CodeAlreadyExistsError)) throw error;
      }
    }
    throw new CodeGenerationError();
  }

  /** Resolves a code to its original URL and counts the click. */
  async resolve(code: string): Promise<ShortUrl> {
    const url = await this.repository.registerClick(code);
    if (!url) throw new UrlNotFoundError(code);
    return url;
  }

  list(): Promise<ShortUrl[]> {
    return this.repository.list();
  }
}