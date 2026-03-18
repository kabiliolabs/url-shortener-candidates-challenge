import { LongUrl } from "../../domain/value-objects/long-url";
import { ShortenedUrl } from "../../domain/entities/shortened-url";
import type { IUrlRepository } from "../../domain/repositories/url-repository";
import type { IShortCodeGenerator } from "../../domain/services/short-code-generator";

export class ShortenUrlUseCase {
  private static readonly MAX_ATTEMPTS = 10;

  constructor(
    private readonly repository: IUrlRepository,
    private readonly generator: IShortCodeGenerator,
  ) {}

  async execute(url: string): Promise<ShortenedUrl> {
    const longUrl = new LongUrl(url);

    for (let attempt = 0; attempt < ShortenUrlUseCase.MAX_ATTEMPTS; attempt++) {
      const code = this.generator.generate();
      if (!(await this.repository.existsByCode(code))) {
        const entry = new ShortenedUrl(code, longUrl);
        await this.repository.save(entry);
        return entry;
      }
    }

    throw new Error("Failed to generate a unique short code after maximum attempts");
  }
}
