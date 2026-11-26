import { canonicalizeUrl } from "./canonicalize-url";
import { generateCode } from "./generate-code";
import type { ShortLinkRepository } from "./short-link-repository";

export type ShortenResult =
  | { ok: true; code: string; url: string }
  | { ok: false; message: string };

export async function shortenUrl(
  repository: ShortLinkRepository,
  input: string,
): Promise<ShortenResult> {
  const canonical = canonicalizeUrl(input);
  if (!canonical.ok) {
    return canonical;
  }

  const existing = await repository.findByUrl(canonical.url);
  if (existing) {
    return { ok: true, code: existing.code, url: existing.url };
  }

  const created = await repository.create({
    url: canonical.url,
    code: generateCode(),
  });

  return { ok: true, code: created.code, url: created.url };
}
