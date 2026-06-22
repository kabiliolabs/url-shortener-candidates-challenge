import { describe, expect, it } from "vitest";
import { UrlShortener } from "./url-shortener";
import {
  CodeCollisionError,
  RetryExhaustedError,
  InvalidUrlError,
} from "../domain/errors";
import type {
  UrlRepository,
  ShortenedUrl,
  ShortenedUrlWithStats,
  ClickMeta,
} from "../ports/url-repository";

class FakeUrlRepository implements UrlRepository {
  private byCode = new Map<string, ShortenedUrl>();
  public createCalls: string[] = [];

  async create(data: { code: string; originalUrl: string }): Promise<ShortenedUrl> {
    this.createCalls.push(data.code);
    if (this.byCode.has(data.code)) throw new CodeCollisionError(data.code);
    const row: ShortenedUrl = {
      id: `id-${this.byCode.size + 1}`,
      code: data.code,
      originalUrl: data.originalUrl,
      createdAt: new Date(0),
    };
    this.byCode.set(data.code, row);
    return row;
  }
  async findByCode(code: string) {
    return this.byCode.get(code) ?? null;
  }
  async list(): Promise<ShortenedUrlWithStats[]> {
    return [];
  }
  async recordClick(_urlId: string, _meta: ClickMeta) {}
}

describe("UrlShortener", () => {
  it("validates the URL and persists a normalized version", async () => {
    const repo = new FakeUrlRepository();
    const service = new UrlShortener(repo, { generateCode: () => "abc123X" });
    const result = await service.shorten("  https://example.com  ");
    expect(result.code).toBe("abc123X");
    expect(result.originalUrl).toBe("https://example.com/");
  });

  it("throws InvalidUrlError for bad input without touching the repo", async () => {
    const repo = new FakeUrlRepository();
    const service = new UrlShortener(repo);
    await expect(service.shorten("javascript:alert(1)")).rejects.toBeInstanceOf(
      InvalidUrlError,
    );
    expect(repo.createCalls).toHaveLength(0);
  });

  it("retries on collision until it finds a free code", async () => {
    const repo = new FakeUrlRepository();
    await repo.create({ code: "taken01", originalUrl: "https://a.com/" });
    const codes = ["taken01", "free007"];
    let i = 0;
    const service = new UrlShortener(repo, { generateCode: () => codes[i++] });
    const result = await service.shorten("https://example.com");
    expect(result.code).toBe("free007");
    expect(repo.createCalls).toEqual(["taken01", "taken01", "free007"]);
  });

  it("throws RetryExhaustedError after maxRetries collisions", async () => {
    const repo = new FakeUrlRepository();
    await repo.create({ code: "dup", originalUrl: "https://a.com/" });
    const service = new UrlShortener(repo, {
      maxRetries: 3,
      generateCode: () => "dup",
    });
    await expect(service.shorten("https://example.com")).rejects.toBeInstanceOf(
      RetryExhaustedError,
    );
  });
});
