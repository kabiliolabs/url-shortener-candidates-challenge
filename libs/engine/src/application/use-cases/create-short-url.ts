import { DestinationUrl } from "../../domain/destination-url";
import {
  ShortCodeAlreadyExistsError,
  ShortCodeGenerationExhaustedError,
} from "../../domain/errors";
import { ShortCode } from "../../domain/short-code";
import type { ShortUrl } from "../../domain/short-url";
import type { Clock } from "../ports/clock";
import type { ShortCodeGenerator } from "../ports/short-code-generator";
import type { UrlRepository } from "../ports/url-repository";

type CreateShortUrlInput = {
  originalUrl: string;
};

type CreateShortUrlOptions = {
  maxAttempts?: number;
};

export class CreateShortUrl {
  private readonly maxAttempts: number;

  constructor(
    private readonly repository: UrlRepository,
    private readonly codeGenerator: ShortCodeGenerator,
    private readonly clock: Clock,
    options: CreateShortUrlOptions = {},
  ) {
    this.maxAttempts = options.maxAttempts ?? 5;

    if (!Number.isInteger(this.maxAttempts) || this.maxAttempts < 1) {
      throw new RangeError("maxAttempts must be a positive integer.");
    }
  }

  async execute(input: CreateShortUrlInput): Promise<ShortUrl> {
    const destination = DestinationUrl.create(input.originalUrl);
    const createdAt = this.clock.now();

    for (let attempt = 0; attempt < this.maxAttempts; attempt += 1) {
      const code = ShortCode.create(this.codeGenerator.generate());

      try {
        return await this.repository.create({
          code: code.value,
          originalUrl: destination.value,
          createdAt,
        });
      } catch (error) {
        if (!(error instanceof ShortCodeAlreadyExistsError)) throw error;
      }
    }

    throw new ShortCodeGenerationExhaustedError();
  }
}
