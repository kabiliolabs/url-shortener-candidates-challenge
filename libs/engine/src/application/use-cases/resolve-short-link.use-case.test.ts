import { describe, expect, it } from "vitest";
import { ResolveShortLinkUseCase } from "./resolve-short-link.use-case";
import { NotFoundError } from "../../shared/errors";
import type {
  CreateShortLinkRecordInput,
  ShortLinkRepositoryPort,
} from "../ports/short-link-repository.port";
import type { ShortLinkEntity } from "../../domain/entities/short-link.entity";

class InMemoryRepository implements ShortLinkRepositoryPort {
  private readonly data = new Map<string, ShortLinkEntity>();

  async create(input: CreateShortLinkRecordInput): Promise<ShortLinkEntity> {
    const value: ShortLinkEntity = {
      code: input.code,
      originalUrl: input.originalUrl,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    };
    this.data.set(input.code, value);
    return value;
  }

  async findByCode(code: string): Promise<ShortLinkEntity | null> {
    return this.data.get(code) ?? null;
  }

  async existsByCode(code: string): Promise<boolean> {
    return this.data.has(code);
  }

  async incrementClicks(code: string): Promise<void> {
    const found = this.data.get(code);
    if (!found) return;
    this.data.set(code, {
      ...found,
      clicks: found.clicks + 1,
      lastVisitedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async listRecent(limit: number): Promise<ShortLinkEntity[]> {
    return Array.from(this.data.values()).slice(0, limit);
  }
}

describe("ResolveShortLinkUseCase", () => {
  it("returns destination and increments clicks", async () => {
    const repository = new InMemoryRepository();
    await repository.create({
      code: "ABCDEF1",
      originalUrl: "https://example.com/a",
    });

    const useCase = new ResolveShortLinkUseCase(repository);
    const resolved = await useCase.execute({ code: "ABCDEF1" });

    expect(resolved.destinationUrl).toBe("https://example.com/a");

    const stored = await repository.findByCode("ABCDEF1");
    expect(stored?.clicks).toBe(1);
    expect(stored?.lastVisitedAt).not.toBeNull();
  });

  it("throws not found for unknown code", async () => {
    const useCase = new ResolveShortLinkUseCase(new InMemoryRepository());

    await expect(useCase.execute({ code: "ZZZZZZ1" })).rejects.toThrow(
      NotFoundError,
    );
  });
});
