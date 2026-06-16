import type { ShortUrlRepository, UrlStatsItem } from "../../domain/repositories/short-url-repository";

export interface GetUrlStatsInput {
  limit?: number;
}

export class GetUrlStatsUseCase {
  constructor(private readonly repository: ShortUrlRepository) {}

  async execute(input: GetUrlStatsInput = {}): Promise<UrlStatsItem[]> {
    return this.repository.list(input.limit ?? 25);
  }
}
