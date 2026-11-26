export type ShortLink = {
  id: string;
  url: string;
  code: string;
  clicks: number;
  createdAt: Date;
};

export type NewShortLink = {
  url: string;
  code: string;
};

export interface ShortLinkRepository {
  create(link: NewShortLink): Promise<ShortLink>;
  findByUrl(url: string): Promise<ShortLink | null>;
  incrementClicks(code: string): Promise<ShortLink | null>;
}
