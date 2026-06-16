import { AppError } from "../errors/app-error";
import type { ShortCodeGenerator } from "../../domain/services/short-code-generator";
import {
  DuplicateShortCodeError,
  type ShortUrlRepository,
} from "../../domain/repositories/short-url-repository";
import { OriginalUrl } from "../../domain/value-objects/original-url";
import { ShortCode } from "../../domain/value-objects/short-code";

export interface CreateShortUrlInput {
  originalUrl: string;
}

export interface CreateShortUrlOutput {
  shortCode: string;
  originalUrl: string;
}

export class CreateShortUrlUseCase {
  private static readonly MAX_ATTEMPTS = 7;

  constructor(
    private readonly repository: ShortUrlRepository,
    private readonly generator: ShortCodeGenerator,
  ) {}

  async execute(input: CreateShortUrlInput): Promise<CreateShortUrlOutput> {
    const originalUrl = OriginalUrl.create(input.originalUrl.trim());

    for (let attempt = 0; attempt < CreateShortUrlUseCase.MAX_ATTEMPTS; attempt++) {
      const generatedCode = this.generator.generate();
      const shortCode = ShortCode.create(generatedCode);

      try {
        const shortUrl = await this.repository.create({
          shortCode: shortCode.toString(),
          originalUrl: originalUrl.toString(),
        });

        return {
          shortCode: shortUrl.shortCode.toString(),
          originalUrl: shortUrl.originalUrl.toString(),
        };
      } catch (error) {
        if (error instanceof DuplicateShortCodeError) {
          continue;
        }

        throw error;
      }
    }

    throw new AppError(
      "CONFLICT",
      "Unable to generate a unique short code right now. Please try again.",
      409,
    );
  }
}
