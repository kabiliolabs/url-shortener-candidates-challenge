import type { UrlRepository } from "../domain/url-repository.port";
import { UrlNotFoundError } from "./url-not-found-error";

export class TrackClickUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(code: string): Promise<void> {
    const url = await this.repository.findByCode(code);
    if (!url) {
      throw new UrlNotFoundError(code);
    }
    await this.repository.update(url.incrementClicks());
  }
}
