export interface UrlClickProps {
  id?: number;
  shortUrlId: number;
  createdAt?: Date;
  ipHash?: string | null;
  userAgentHash?: string | null;
}


export interface ShortenedUrlProps {
  id?: number;
  shortCode: string;
  originalUrl: string;
  createdAt?: Date;
  createdByIpHash?: string | null;
  createdByUserAgentHash?: string | null;
  clicks?: number;
}
