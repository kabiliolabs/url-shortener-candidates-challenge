import type { CodeGenerator } from "../domain/code-generator";
import { CodeGenerationError, DuplicateCodeError } from "../domain/errors";
import { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";

const MAX_ATTEMPTS = 5;

export class ShortenUrl {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly codeGenerator: CodeGenerator,
  ) {}

  async execute(originalUrl: string): Promise<ShortUrl> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = this.codeGenerator.generate();

      if (await this.urlRepository.exists(code)) {
        continue;
      }

      const shortUrl = new ShortUrl({ code, originalUrl });

      try {
        await this.urlRepository.save(shortUrl);
        return shortUrl;
      } catch (error) {
        if (error instanceof DuplicateCodeError) {
          continue;
        }
        throw error;
      }
    }

    throw new CodeGenerationError();
  }
}
