import { canonicalizeUrl } from "./canonicalize-url";
import { isCodeCollision } from "./code-collision";
import { generateCode } from "./generate-code";
import type { ShortLinkRepository } from "./short-link-repository";

const MAX_CODE_ATTEMPTS = 5;

export type ShortenResult =
  | { ok: true; code: string; url: string }
  | { ok: false; message: string };

export async function shortenUrl(
  repository: ShortLinkRepository,
  input: string,
  generate: () => string = generateCode,
): Promise<ShortenResult> {
  const canonical = canonicalizeUrl(input);
  if (!canonical.ok) {
    return canonical;
  }

  const existing = await repository.findByUrl(canonical.url);
  if (existing) {
    return { ok: true, code: existing.code, url: existing.url };
  }

  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    try {
      const created = await repository.create({
        url: canonical.url,
        code: generate(),
      });
      return { ok: true, code: created.code, url: created.url };
    } catch (error) {
      if (!isCodeCollision(error)) {
        throw error;
      }
    }
  }

  return {
    ok: false,
    message: "Could not assign a unique short code. Try again.",
  };
}
