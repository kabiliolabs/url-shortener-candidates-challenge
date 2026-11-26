import type { ShortLinkRepository } from "./short-link-repository";

export async function resolveCode(
  repository: ShortLinkRepository,
  code: string,
): Promise<string | null> {
  const link = await repository.incrementClicks(code);
  return link?.url ?? null;
}
