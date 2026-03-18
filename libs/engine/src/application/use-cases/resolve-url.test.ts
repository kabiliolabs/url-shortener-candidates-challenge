import { describe, it, expect, vi } from "vitest";
import { ResolveUrlUseCase } from "./resolve-url";
import { InMemoryUrlRepository } from "../../infrastructure/repositories/in-memory-url-repository";
import { ShortenedUrl } from "../../domain/entities/shortened-url";
import { ShortCode } from "../../domain/value-objects/short-code";
import { LongUrl } from "../../domain/value-objects/long-url";

describe("ResolveUrlUseCase", () => {
  it("resolves a known code to its long URL", async () => {
    const repo = new InMemoryUrlRepository();
    await repo.save(
      new ShortenedUrl(new ShortCode("abc1234"), new LongUrl("https://example.com")),
    );

    const result = await new ResolveUrlUseCase(repo).execute("abc1234");
    expect(result.value).toBe("https://example.com/");
  });

  it("throws for an unknown code", async () => {
    const repo = new InMemoryUrlRepository();
    await expect(new ResolveUrlUseCase(repo).execute("zzz9999")).rejects.toThrow(
      'Short code not found: "zzz9999"',
    );
  });

  it("throws for an invalid code format without querying the repository", async () => {
    const repo = new InMemoryUrlRepository();
    const findSpy = vi.spyOn(repo, "findByCode");

    await expect(new ResolveUrlUseCase(repo).execute("bad")).rejects.toThrow();
    expect(findSpy).not.toHaveBeenCalled();
  });
});
