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

  describe("findAll", () => {
    it("returns empty array when no URLs saved", async () => {
      expect(await repo.findAll()).toEqual([]);
    });

    it("returns saved entry with clicks 0", async () => {
      await repo.save(entry);
      const all = await repo.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].code).toBe("abc1234");
      expect(all[0].url).toBe(entry.longUrl.value);
      expect(all[0].clicks).toBe(0);
      expect(all[0].createdAt).toBeInstanceOf(Date);
    });

    it("returns multiple entries (both present)", async () => {
      const code2 = new ShortCode("xyz9876");
      const entry2 = new ShortenedUrl(code2, new LongUrl("https://other.com"));
      await repo.save(entry);
      await repo.save(entry2);
      const all = await repo.findAll();
      expect(all).toHaveLength(2);
      const codes = all.map((e) => e.code);
      expect(codes).toContain("abc1234");
      expect(codes).toContain("xyz9876");
    });
  });

  describe("incrementClicks", () => {
    it("increments click count for a saved URL", async () => {
      await repo.save(entry);
      await repo.incrementClicks(code);
      const all = await repo.findAll();
      expect(all[0].clicks).toBe(1);
    });

    it("increments click count multiple times", async () => {
      await repo.save(entry);
      await repo.incrementClicks(code);
      await repo.incrementClicks(code);
      await repo.incrementClicks(code);
      const all = await repo.findAll();
      expect(all[0].clicks).toBe(3);
    });

    it("findAll reflects updated click count", async () => {
      await repo.save(entry);
      expect((await repo.findAll())[0].clicks).toBe(0);
      await repo.incrementClicks(code);
      expect((await repo.findAll())[0].clicks).toBe(1);
    });
  });
});
