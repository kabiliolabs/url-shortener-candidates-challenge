import { describe, expect, it } from "vitest";
import { CreateShortLinkUseCase } from "./create-short-link.use-case";
import { RateLimitError } from "../../shared/errors";
import type { AbuseProtectionPort } from "../ports/abuse-protection.port";
import type { IdGeneratorPort } from "../ports/id-generator.port";
import type {
  CreateShortLinkRecordInput,
  ShortLinkRepositoryPort,
} from "../ports/short-link-repository.port";
import type { ShortLinkEntity } from "../../domain/entities/short-link.entity";

class InMemoryRepository implements ShortLinkRepositoryPort {
  private readonly data = new Map<string, ShortLinkEntity>();

  async create(input: CreateShortLinkRecordInput): Promise<ShortLinkEntity> {
    const entity: ShortLinkEntity = {
      code: input.code,
      originalUrl: input.originalUrl,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastVisitedAt: null,
    };

    this.data.set(input.code, entity);

    return entity;
  }

  async findByCode(code: string): Promise<ShortLinkEntity | null> {
    return this.data.get(code) ?? null;
  }

  async existsByCode(code: string): Promise<boolean> {
    return this.data.has(code);
  }

  async incrementClicks(code: string): Promise<void> {
    const found = this.data.get(code);

    if (!found) {
      return;
    }

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

class SequentialGenerator implements IdGeneratorPort {
  private index = 0;

  constructor(private readonly values: string[]) {}

  generate(): string {
    const value = this.values[this.index] ?? this.values[this.values.length - 1];
    this.index += 1;
    return value;
  }
}

class PassThroughAbuseProtection implements AbuseProtectionPort {
  async ensureCanCreate(): Promise<void> {
    return;
  }
}

class AlwaysDenyAbuseProtection implements AbuseProtectionPort {
  async ensureCanCreate(): Promise<void> {
    throw new RateLimitError("Too many requests");
  }
}

describe("CreateShortLinkUseCase", () => {
  it("creates short URL and retries if code collides", async () => {
    const repository = new InMemoryRepository();
    await repository.create({
      code: "AAAAAAA",
      originalUrl: "https://example.com/already-exists",
    });

    const useCase = new CreateShortLinkUseCase(
      repository,
      new SequentialGenerator(["AAAAAAA", "BBBBBBB"]),
      new PassThroughAbuseProtection(),
      "http://localhost:5173",
    );

    const result = await useCase.execute({
      originalUrl: "https://example.com/new",
      ipAddress: "127.0.0.1",
    });

    expect(result.shortCode).toBe("BBBBBBB");
    expect(result.shortUrl).toBe("http://localhost:5173/s/BBBBBBB");
  });

  it("throws when rate limit is exceeded", async () => {
    const useCase = new CreateShortLinkUseCase(
      new InMemoryRepository(),
      new SequentialGenerator(["CCCCCCC"]),
      new AlwaysDenyAbuseProtection(),
      "http://localhost:5173",
    );

    await expect(
      useCase.execute({
        originalUrl: "https://example.com/new",
        ipAddress: "127.0.0.1",
      }),
    ).rejects.toThrow(RateLimitError);
  });
});
