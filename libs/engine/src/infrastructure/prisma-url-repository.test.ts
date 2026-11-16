import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { PrismaUrlRepository } from "./prisma-url-repository";
import { ShortUrl } from "../domain/short-url";
import { DuplicateCodeError } from "../domain/errors";

const prisma = new PrismaClient();

describe("PrismaUrlRepository", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves a new ShortUrl and finds it by code (save-then-findByCode round trip)", async () => {
    const repository = new PrismaUrlRepository(prisma);
    const code = randomUUID().slice(0, 7);
    const shortUrl = new ShortUrl({ code, originalUrl: "https://example.com" });

    await repository.save(shortUrl);
    const found = await repository.findByCode(code);

    expect(found).not.toBeNull();
    expect(found?.code).toBe(code);
    expect(found?.originalUrl).toBe("https://example.com");
    expect(found?.clickCount).toBe(0);
  });

  it("returns null for an unknown code", async () => {
    const repository = new PrismaUrlRepository(prisma);

    expect(await repository.findByCode("does-not-exist")).toBeNull();
  });

  it("reports whether a code exists", async () => {
    const repository = new PrismaUrlRepository(prisma);
    const code = randomUUID().slice(0, 7);
    await repository.save(new ShortUrl({ code, originalUrl: "https://example.com" }));

    expect(await repository.exists(code)).toBe(true);
    expect(await repository.exists("unknown-code")).toBe(false);
  });

  it("lists saved ShortUrls newest first, bounded by limit", async () => {
    const repository = new PrismaUrlRepository(prisma);
    const codeA = randomUUID().slice(0, 7);
    const codeB = randomUUID().slice(0, 7);
    await repository.save(new ShortUrl({ code: codeA, originalUrl: "https://a.example.com" }));
    await repository.save(new ShortUrl({ code: codeB, originalUrl: "https://b.example.com" }));

    const list = await repository.list({ limit: 2, offset: 0 });

    expect(list.map((url) => url.code)).toEqual([codeB, codeA]);
  });

  it("updates clicks when saving an already-persisted ShortUrl", async () => {
    const repository = new PrismaUrlRepository(prisma);
    const code = randomUUID().slice(0, 7);
    const shortUrl = new ShortUrl({ code, originalUrl: "https://example.com" });
    await repository.save(shortUrl);

    shortUrl.recordClick();
    await repository.save(shortUrl);

    const found = await repository.findByCode(code);
    expect(found?.clickCount).toBe(1);
  });

  it("throws DuplicateCodeError when a different URL collides on an existing code", async () => {
    const repository = new PrismaUrlRepository(prisma);
    const code = randomUUID().slice(0, 7);
    await prisma.shortUrl.create({
      data: { code, originalUrl: "https://existing.example.com", clicks: 0 },
    });

    const colliding = new ShortUrl({ code, originalUrl: "https://other.example.com" });

    await expect(repository.save(colliding)).rejects.toThrow(DuplicateCodeError);
    const stillOriginal = await repository.findByCode(code);
    expect(stillOriginal?.originalUrl).toBe("https://existing.example.com");
  });
});
