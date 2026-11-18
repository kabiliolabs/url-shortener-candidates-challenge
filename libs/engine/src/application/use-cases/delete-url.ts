import { UrlNotFoundError } from "../../domain/errors/url-not-found.error";
import type { UrlRepository } from "../../domain/repositories/url-repository";

export class DeleteUrlUseCase {
  constructor(private readonly urls: UrlRepository) {}

  async execute(shortCode: string): Promise<void> {
    const deleted = await this.urls.softDeleteByCode(shortCode);
    if (!deleted) {
      throw new UrlNotFoundError(shortCode);
    }
  }
}
