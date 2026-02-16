import { atom } from "jotai";
import type { ShortenedUrlDto } from "../api/types.js";
import { listUrls } from "../api/client.js";

/** One row in the URL list table. */
export interface UrlListRow {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

function dtoToRow(dto: ShortenedUrlDto): UrlListRow {
  return {
    id: dto.id,
    shortCode: dto.code,
    originalUrl: dto.url,
    clicks: dto.clickCount,
    createdAt: dto.createdAt,
  };
}

/** Global list of shortened URLs (table rows). */
export const urlListAtom = atom<UrlListRow[]>([]);

/** Fetches URLs from the API and updates the url list atom. Pass the setter from useSetAtom(urlListAtom). */
export async function loadUrlList(
  setList: (value: UrlListRow[] | ((prev: UrlListRow[]) => UrlListRow[])) => void
): Promise<void> {
  const res = await listUrls();
  setList(res.urls.map(dtoToRow));
}
