import {
  baseUrl,
  generateShortCode,
  shortenedUrls,
} from "@url-shortener/engine";

type ShortenedUrlStore = Pick<Map<string, string>, "get" | "set">;

type ShortenUrlDependencies = {
  currentBaseUrl: string | undefined;
  createCode: () => string;
  store: ShortenedUrlStore;
};

export type ShortenUrlActionResult =
  | { error: string }
  | { shortenedUrl: string };

const defaultDependencies: ShortenUrlDependencies = {
  currentBaseUrl: baseUrl,
  createCode: generateShortCode,
  store: shortenedUrls,
};

export function buildShortenedUrlPrefix(
  currentBaseUrl: string | undefined,
): string {
  return currentBaseUrl ? `${currentBaseUrl}/s/` : "-";
}

export function getSubmittedUrl(formData: FormData): string | null {
  const url = formData.get("url");

  return typeof url === "string" && url ? url : null;
}

export function createShortenedUrl(
  url: string,
  { currentBaseUrl, createCode, store }: ShortenUrlDependencies,
): { shortenedUrl: string } {
  const shortCode = createCode();

  store.set(shortCode, url);

  return {
    shortenedUrl: `${currentBaseUrl}/s/${shortCode}`,
  };
}

export async function handleShortenUrlAction(
  request: Request,
  dependencies: ShortenUrlDependencies = defaultDependencies,
): Promise<ShortenUrlActionResult> {
  const formData = await request.formData();
  const url = getSubmittedUrl(formData);

  if (!url) {
    return { error: "URL is required" };
  }

  return createShortenedUrl(url, dependencies);
}

export function findShortenedUrl(
  code: string | undefined,
  store: Pick<Map<string, string>, "get"> = shortenedUrls,
): string | null {
  if (!code) {
    return null;
  }

  return store.get(code) ?? null;
}
