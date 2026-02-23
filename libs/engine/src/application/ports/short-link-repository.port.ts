import type { ShortLinkEntity } from "../../domain/entities/short-link.entity";

export interface CreateShortLinkRecordInput {
  code: string;
  originalUrl: string;
}

export interface ShortLinkRepositoryPort {
  create(input: CreateShortLinkRecordInput): Promise<ShortLinkEntity>;
  findByCode(code: string): Promise<ShortLinkEntity | null>;
  existsByCode(code: string): Promise<boolean>;
  incrementClicks(code: string): Promise<void>;
  listRecent(limit: number): Promise<ShortLinkEntity[]>;
}
