import { randomUUID } from "node:crypto";
import { CodeAlreadyExistsError } from "../domain/errors";
import type { ShortUrl } from "../domain/short-url";
import type { UrlRepository } from "../domain/url-repository";

/** Test double and reference implementation of the repository port. */
export class InMemoryUrlRepository implements UrlRepository {
  private readonly urls = new Map<string, ShortUrl>();

  async create(input: { code: string; originalUrl: string }): Promise<ShortUrl> {
    if (this.urls.has(input.code)) {
      throw new CodeAlreadyExistsError(input.code);
    }
    const url: ShortUrl = {
      id: randomUUID(),
      code: input.code,
      originalUrl: input.originalUrl,
      clicks: 0,
      createdAt: new Date(),
    };
    this.urls.set(url.code, url);
    return url;
  }

  async findByCode(code: string): Promise<ShortUrl | null> {
    return this.urls.get(code) ?? null;
  }

  async registerClick(code: string): Promise<ShortUrl | null> {
    const current = this.urls.get(code);
    if (!current) return null;
    const updated = { ...current, clicks: current.clicks + 1 };
    this.urls.set(code, updated);
    return updated;
  }

  async list(): Promise<ShortUrl[]> {
    return [...this.urls.values()].reverse();
  }
}