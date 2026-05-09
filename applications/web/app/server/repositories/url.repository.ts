export interface CreateUrlData {
  shortCode: string;
  originalUrl: string;
}

export interface UrlWithStats {
  id: number;
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  clickCount: number;
}

export interface UrlRepository {
  findByCode(
    code: string
  ): Promise<{
    id: number;
    shortCode: string;
    originalUrl: string;
    createdAt: Date;
  } | null>;
  create(
    data: CreateUrlData
  ): Promise<{
    id: number;
    shortCode: string;
    originalUrl: string;
    createdAt: Date;
  }>;
  findAllWithStats(): Promise<UrlWithStats[]>;
  findByCodeWithStats(code: string): Promise<UrlWithStats | null>;
}
