import { Url } from '../entities/Url';

export interface PaginatedResult<T> {
  data: T[]
  total: number
}

export interface IUrlRepository {
  save(url: Url): Promise<void>
  findByCode(code: string): Promise<Url | null>
  incrementClicks(code: string): Promise<void>
  findRecent(offset: number, limit: number): Promise<PaginatedResult<Url>>
}
