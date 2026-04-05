import { SHORT_CODE_LENGTH } from "@url-shortener/engine";

const URL_SAFE_SHORT_CODE_PATTERN = `[A-Za-z0-9_-]{${SHORT_CODE_LENGTH}}`;

export function buildShortCodePattern(basePrefix?: string): RegExp {
  if (!basePrefix) {
    return new RegExp(`^${URL_SAFE_SHORT_CODE_PATTERN}$`);
  }

  const escapedPrefix = basePrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedPrefix}${URL_SAFE_SHORT_CODE_PATTERN}$`);
}
