import type { ShortUrl } from "../../domain/short-url";
import type { ClickEvent } from "../../domain/click-event";

export type CreateShortUrlRecord = Omit<ShortUrl, "clicks">;

export interface UrlRepository {
  create(input: CreateShortUrlRecord): Promise<ShortUrl>;
  findAndIncrementClicks(code: string): Promise<ShortUrl | null>;
  list(): Promise<ShortUrl[]>;
  delete(code: string): Promise<boolean>;
  listClickEvents(code: string): Promise<ClickEvent[]>;
}
