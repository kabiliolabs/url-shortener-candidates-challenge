import { Url } from '../domain/entities/Url';
import type { UrlDto } from '../dtos/UrlDto';

export class UrlMapper {
  static toDto(url: Url): UrlDto {
    return {
      id: url.id!,
      originalUrl: url.originalUrl.getValue,
      shortCode: url.shortCode.getValue,
      clicks: url.clicks,
      createdAt: url.createdAt.toISOString(),
    };
  }
}
