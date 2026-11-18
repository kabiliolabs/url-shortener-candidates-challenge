import type { ShortenedUrl } from "../../domain/entities/shortened-url";
import { DuplicateShortCodeError } from "../../domain/errors/duplicate-short-code.error";
import { InvalidUrlError } from "../../domain/errors/invalid-url.error";
import type { UrlRepository } from "../../domain/repositories/url-repository";
import type { CodeGenerator } from "../services/code-generator";
import {
  createShortUrlSchema,
  type CreateShortUrlInput,
} from "../validation/create-short-url";

const MAX_CREATE_ATTEMPTS = 5;

export class CreateShortUrlUseCase {
  constructor(
    private readonly urls: UrlRepository,
    private readonly codeGenerator: CodeGenerator,
  ) {}

  async execute(input: CreateShortUrlInput): Promise<ShortenedUrl> {
    const result = createShortUrlSchema.safeParse(input);

    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.message);
      throw new InvalidUrlError(issues[0] ?? "Invalid URL", issues);
    }

    const { originalUrl } = result.data;

    for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt++) {
      const shortCode = await this.codeGenerator.generateUnique((code) =>
        this.urls.existsByCode(code),
      );

      try {
        return await this.urls.create({ originalUrl, shortCode });
      } catch (error) {
        if (error instanceof DuplicateShortCodeError) continue;
        throw error;
      }
    }

    throw new Error("Could not generate a unique short code. Please try again.");
  }
}
