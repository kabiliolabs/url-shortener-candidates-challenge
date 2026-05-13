import type { UrlRepository } from "../domain/url-repository";

export class TrackClickUseCase {
  constructor(private readonly repository: UrlRepository) {}

  async execute(code: string): Promise<void> {
    await this.repository.incrementClicks(code);
  }
}
