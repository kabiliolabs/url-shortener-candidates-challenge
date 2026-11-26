import { codeCollisionError } from "../domain/code-collision";
import type {
  NewShortLink,
  ShortLink,
  ShortLinkRepository,
} from "../ports/short-link-repository";

export class InMemoryShortLinkRepository implements ShortLinkRepository {
  private readonly byUrl = new Map<string, ShortLink>();
  private readonly byCode = new Map<string, ShortLink>();

  async create(link: NewShortLink): Promise<ShortLink> {
    const existingUrl = this.byUrl.get(link.url);
    if (existingUrl) {
      return existingUrl;
    }
    if (this.byCode.has(link.code)) {
      throw codeCollisionError();
    }

    const created: ShortLink = {
      id: globalThis.crypto.randomUUID(),
      url: link.url,
      code: link.code,
      clicks: 0,
      createdAt: new Date(),
    };
    this.byUrl.set(created.url, created);
    this.byCode.set(created.code, created);
    return created;
  }

  async findByUrl(url: string): Promise<ShortLink | null> {
    return this.byUrl.get(url) ?? null;
  }

  async list(limit: number): Promise<ShortLink[]> {
    return [...this.byUrl.values()]
      .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
      .slice(0, limit);
  }

  async incrementClicks(code: string): Promise<ShortLink | null> {
    const existing = this.byCode.get(code);
    if (!existing) {
      return null;
    }

    const updated: ShortLink = { ...existing, clicks: existing.clicks + 1 };
    this.byUrl.set(existing.url, updated);
    this.byCode.set(existing.code, updated);
    return updated;
  }
}
