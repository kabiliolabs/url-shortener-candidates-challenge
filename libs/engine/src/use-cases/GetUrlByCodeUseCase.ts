import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import type { UrlDto } from '../dtos/UrlDto';
import { UrlMapper } from './UrlMapper';
import { UrlNotFoundError } from '../domain/errors/UrlErrors';

export class GetUrlByCodeUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(code: string): Promise<UrlDto> {
    const url = await this.urlRepository.findByCode(code);
    
    if (!url) {
      throw new UrlNotFoundError(code);
    }

    return UrlMapper.toDto(url);
  }
}
