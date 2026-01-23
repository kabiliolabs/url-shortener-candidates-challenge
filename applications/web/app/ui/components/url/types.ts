// URL Card Types
export interface UrlCardProps {
  shortCode: string;
  shortenedUrl: string;
  originalUrl: string;
  clicks?: number;
  showActions?: boolean;
}

// URL List Types
export interface UrlItem {
  shortCode: string;
  shortenedUrl: string;
  originalUrl: string;
  clicks: number;
}

export interface UrlListProps {
  urls: UrlItem[];
  title?: string;
  emptyMessage?: string;
}
