import type { ShortenedURL } from "../../domain/shortened-url";
import type { Result } from "../../../../shared/types/result";

export type StorageUnavailable = { code: "storage_unavailable" };
export type InsertShortenedURLError =
  | StorageUnavailable
  | { code: "code_conflict" };

export interface ShortenerRepository {
  insert(link: ShortenedURL): Promise<Result<void, InsertShortenedURLError>>;
  findByCode(
    code: string,
  ): Promise<Result<ShortenedURL | null, StorageUnavailable>>;
}
