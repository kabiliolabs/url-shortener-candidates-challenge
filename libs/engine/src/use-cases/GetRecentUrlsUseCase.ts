import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import type { UrlDto } from '../dtos/UrlDto';
import { UrlMapper } from './UrlMapper';

export class GetRecentUrlsUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(limit: number = 5): Promise<UrlDto[]> {
    const urls = await this.urlRepository.findRecent(limit);
    return urls.map(UrlMapper.toDto);
  }
}
