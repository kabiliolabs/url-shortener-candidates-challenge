import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUrlRepository } from "./in-memory-url-repository";
import { ShortenedUrl } from "../../domain/entities/shortened-url";
import { ShortCode } from "../../domain/value-objects/short-code";
import { LongUrl } from "../../domain/value-objects/long-url";

describe("InMemoryUrlRepository", () => {
  let repo: InMemoryUrlRepository;
  const code = new ShortCode("abc1234");
  const entry = new ShortenedUrl(code, new LongUrl("https://example.com"));

  beforeEach(() => {
    repo = new InMemoryUrlRepository();
  });

  it("findByCode returns null for unknown code", async () => {
    expect(await repo.findByCode(new ShortCode("zzz9999"))).toBeNull();
  });

  it("existsByCode returns false before save", async () => {
    expect(await repo.existsByCode(code)).toBe(false);
  });

  it("save then findByCode returns the saved entry", async () => {
    await repo.save(entry);
    expect(await repo.findByCode(code)).toBe(entry);
  });

  it("existsByCode returns true after save", async () => {
    await repo.save(entry);
    expect(await repo.existsByCode(code)).toBe(true);
  });

  it("saving twice with the same code overwrites", async () => {
    const updated = new ShortenedUrl(code, new LongUrl("https://updated.com"));
    await repo.save(entry);
    await repo.save(updated);
    expect(await repo.findByCode(code)).toBe(updated);
  });
});
