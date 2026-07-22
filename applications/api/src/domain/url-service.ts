import { CodeGenerationError, DuplicateCodeError, NotFoundError } from "./errors.js";
import type { CreateShortenedUrlInput, ShortenedUrl } from "../models/shortened-url.js";
import type { UrlRepository } from "../types/url-repository.js";
import { validateDestinationUrl } from "./validate-url.js";

const MAX_CODE_GENERATION_ATTEMPTS = 5;

export class UrlService {
  constructor(
    private readonly repository: UrlRepository,
    private readonly createCode: () => string,
  ) {}

  async create(input: CreateShortenedUrlInput): Promise<ShortenedUrl> {
    const url = validateDestinationUrl(input.url);

    for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
      const shortenedUrl: ShortenedUrl = {
        code: this.createCode(),
        url,
        createdAt: new Date(),
        clicks: 0,
      };

      try {
        await this.repository.create(shortenedUrl);
        return shortenedUrl;
      } catch (error) {
        if (!(error instanceof DuplicateCodeError)) {
          throw error;
        }
      }
    }

    throw new CodeGenerationError();
  }

  async resolveAndRecordVisit(code: string): Promise<ShortenedUrl> {
    const shortenedUrl = await this.repository.incrementClicks(code);
    if (!shortenedUrl) {
      throw new NotFoundError();
    }

    return shortenedUrl;
  }

  getAll(limit: number): Promise<ShortenedUrl[]> {
    return this.repository.findAll(limit);
  }
}
