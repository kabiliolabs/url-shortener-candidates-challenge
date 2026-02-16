import type { ShortenedUrlDto } from "../api/types.js";

export interface UseShortenUrlReturn {
  url: string;
  setUrl: (value: string) => void;
  submit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  shortenedUrl: string | null;
  reset: () => void;
}

export interface UseCopyToClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  copyError: string | null;
  clearCopyError: () => void;
}

export interface UseUrlListReturn {
  urls: ShortenedUrlDto[];
  loading: boolean;
  isFetching: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
}
