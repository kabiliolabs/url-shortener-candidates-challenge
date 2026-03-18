import type { IUrlRepository } from "../../domain/repositories/url-repository";
import type { ShortCode } from "../../domain/value-objects/short-code";
import type { ShortenedUrl } from "../../domain/entities/shortened-url";

export class InMemoryUrlRepository implements IUrlRepository {
  private readonly store = new Map<string, ShortenedUrl>();

  async save(entry: ShortenedUrl): Promise<void> {
    this.store.set(entry.shortCode.value, entry);
  }

  async findByCode(code: ShortCode): Promise<ShortenedUrl | null> {
    return this.store.get(code.value) ?? null;
  }

  async existsByCode(code: ShortCode): Promise<boolean> {
    return this.store.has(code.value);
  }
}
