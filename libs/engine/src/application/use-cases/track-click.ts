import { AppError } from "../errors/app-error";
import type { ShortUrlRepository } from "../../domain/repositories/short-url-repository";
import { ShortCode } from "../../domain/value-objects/short-code";

export interface TrackClickInput {
  shortCode: string;
  clickedAt: Date;
}

export class TrackClickUseCase {
  constructor(private readonly repository: ShortUrlRepository) {}

  async execute(input: TrackClickInput): Promise<void> {
    const shortCode = ShortCode.create(input.shortCode);
    const exists = await this.repository.existsByCode(shortCode.toString());

    if (!exists) {
      throw new AppError("NOT_FOUND", "Short URL not found.", 404);
    }

    await this.repository.incrementClickCount(shortCode.toString(), input.clickedAt);
  }
}
