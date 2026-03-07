import type { IUrlRepository } from '../domain/repositories/IUrlRepository';
import type { UrlDto } from '../dtos/UrlDto';
import { UrlMapper } from './UrlMapper';

export interface PaginatedUrlsDto {
  data: UrlDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class GetRecentUrlsUseCase {
  constructor(private readonly urlRepository: IUrlRepository) {}

  async execute(page: number = 1, limit: number = 5): Promise<PaginatedUrlsDto> {
    const offset = (Math.max(1, page) - 1) * limit
    const result = await this.urlRepository.findRecent(offset, limit)

    return {
      data: result.data.map(UrlMapper.toDto),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    }
  }
}
