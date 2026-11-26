import type { ShortLink, ShortLinkRepository } from "../ports/short-link-repository";

export const LIST_LIMIT = 20;

export async function listShortLinks(
  repository: ShortLinkRepository,
  limit = LIST_LIMIT,
): Promise<ShortLink[]> {
  return repository.list(limit);
}
