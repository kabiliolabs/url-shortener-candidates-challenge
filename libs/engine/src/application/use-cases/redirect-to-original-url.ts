import { AppError } from "../errors/app-error";
import type { ShortUrlRepository } from "../../domain/repositories/short-url-repository";
import { ShortCode } from "../../domain/value-objects/short-code";

export interface RedirectToOriginalUrlInput {
  shortCode: string;
}

export interface RedirectToOriginalUrlOutput {
  originalUrl: string;
}

export class RedirectToOriginalUrlUseCase {
  constructor(private readonly repository: ShortUrlRepository) {}

  async execute(
    input: RedirectToOriginalUrlInput,
  ): Promise<RedirectToOriginalUrlOutput> {
    const shortCode = ShortCode.create(input.shortCode);

    const shortUrl = await this.repository.findByCode(shortCode.toString());

    if (!shortUrl) {
      throw new AppError("NOT_FOUND", "Short URL not found.", 404);
    }

    return { originalUrl: shortUrl.originalUrl.toString() };
  }
}
