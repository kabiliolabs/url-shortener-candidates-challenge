import type { ShortenedUrlEntity } from "../types.js";

export interface UrlListItemDto {
  id: string;
  code: string;
  url: string;
  createdAt: string;
  clickCount: number;
}

export function mapEntityToListDto(entity: ShortenedUrlEntity): UrlListItemDto {
  return {
    id: entity.id,
    code: entity.code,
    url: entity.url,
    createdAt: entity.createdAt.toISOString(),
    clickCount: entity.clickCount,
  };
}
