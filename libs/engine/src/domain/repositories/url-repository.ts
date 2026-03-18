import type { ShortCode } from "../value-objects/short-code";
import type { ShortenedUrl } from "../entities/shortened-url";

export interface IUrlRepository {
  save(entry: ShortenedUrl): Promise<void>;
  findByCode(code: ShortCode): Promise<ShortenedUrl | null>;
  existsByCode(code: ShortCode): Promise<boolean>;
}
