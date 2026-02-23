import { describe, expect, it } from "vitest";
import { ListShortLinksUseCase } from "./list-short-links.use-case";
import type {
  CreateShortLinkRecordInput,
  ShortLinkRepositoryPort,
} from "../ports/short-link-repository.port";
import type { ShortLinkEntity } from "../../domain/entities/short-link.entity";

class StubRepository implements ShortLinkRepositoryPort {
  constructor(private readonly items: ShortLinkEntity[]) {}

  async create(input: CreateShortLinkRecordInput): Promise<ShortLinkEntity> {
    const created: ShortLinkEntity = {
      code: input.code,
      originalUrl: input.originalUrl,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    };
    return created;
  }

  async findByCode(code: string): Promise<ShortLinkEntity | null> {
    return this.items.find((item) => item.code === code) ?? null;
  }

  async existsByCode(code: string): Promise<boolean> {
    return this.items.some((item) => item.code === code);
  }

  async incrementClicks(): Promise<void> {
    return;
  }

  async listRecent(limit: number): Promise<ShortLinkEntity[]> {
    return this.items.slice(0, limit);
  }
}

describe("ListShortLinksUseCase", () => {
  it("maps entities into view model including short url", async () => {
    const now = new Date("2026-02-23T00:00:00.000Z");
    const repository = new StubRepository([
      {
        code: "ABC1234",
        originalUrl: "https://example.com/x",
        clicks: 3,
        createdAt: now,
        updatedAt: now,
        lastVisitedAt: now,
      },
    ]);

    const useCase = new ListShortLinksUseCase(repository, "http://localhost:3000");

    const result = await useCase.execute({ limit: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      code: "ABC1234",
      shortUrl: "http://localhost:3000/s/ABC1234",
      originalUrl: "https://example.com/x",
      clicks: 3,
      createdAt: now.toISOString(),
      lastVisitedAt: now.toISOString(),
    });
  });

  it("normalizes limits below minimum and above maximum", async () => {
    const now = new Date("2026-02-23T00:00:00.000Z");
    const repository = new StubRepository(
      Array.from({ length: 5 }).map((_, index) => ({
        code: `CODE00${index}`,
        originalUrl: `https://example.com/${index}`,
        clicks: index,
        createdAt: now,
        updatedAt: now,
        lastVisitedAt: null,
      })),
    );

    const useCase = new ListShortLinksUseCase(repository, "http://localhost:3000");

    const minLimited = await useCase.execute({ limit: 0 });
    expect(minLimited.items).toHaveLength(1);

    const maxLimited = await useCase.execute({ limit: 9999 });
    expect(maxLimited.items).toHaveLength(5);
  });
});
