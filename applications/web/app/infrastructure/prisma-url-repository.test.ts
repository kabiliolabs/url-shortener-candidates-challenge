import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShortenedUrl, ShortCode, OriginalUrl } from "@url-shortener/engine";

const mockShortenedUrl = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
  findMany: vi.fn(),
}));

vi.mock("./prisma-client", () => ({
  prisma: { shortenedUrl: mockShortenedUrl },
}));

import { PrismaUrlRepository } from "./prisma-url-repository";

const baseRecord = {
  id: "id-1",
  shortCode: "abc1234",
  originalUrl: "https://example.com",
  clicks: 3,
  createdAt: new Date("2024-01-01"),
};

describe("PrismaUrlRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("save", () => {
    it("calls prisma.create with the correct data", async () => {
      mockShortenedUrl.create.mockResolvedValue(undefined);
      const repo = new PrismaUrlRepository();
      const url = new ShortenedUrl(
        "id-1",
        ShortCode.from("abc1234"),
        OriginalUrl.fromStorage("https://example.com"),
        0,
        new Date("2024-01-01"),
      );

      await repo.save(url);

      expect(mockShortenedUrl.create).toHaveBeenCalledWith({
        data: {
          id: "id-1",
          shortCode: "abc1234",
          originalUrl: "https://example.com",
          clicks: 0,
          createdAt: new Date("2024-01-01"),
        },
      });
    });
  });

  describe("incrementClicks", () => {
    it("returns the updated URL on success", async () => {
      mockShortenedUrl.update.mockResolvedValue({ ...baseRecord, clicks: 4 });
      const repo = new PrismaUrlRepository();

      const result = await repo.incrementClicks("abc1234");

      expect(result).toBeInstanceOf(ShortenedUrl);
      expect(result!.clicks).toBe(4);
      expect(mockShortenedUrl.update).toHaveBeenCalledWith({
        where: { shortCode: "abc1234" },
        data: { clicks: { increment: 1 } },
      });
    });

    it("returns null on P2025 (record not found)", async () => {
      const err = Object.assign(new Error("record not found"), { code: "P2025" });
      mockShortenedUrl.update.mockRejectedValue(err);
      const repo = new PrismaUrlRepository();

      const result = await repo.incrementClicks("missing");

      expect(result).toBeNull();
    });

    it("rethrows unexpected errors", async () => {
      mockShortenedUrl.update.mockRejectedValue(new Error("connection error"));
      const repo = new PrismaUrlRepository();

      await expect(repo.incrementClicks("abc1234")).rejects.toThrow("connection error");
    });
  });

  describe("findByOriginalUrl", () => {
    it("returns the entity when found", async () => {
      mockShortenedUrl.findUnique.mockResolvedValue(baseRecord);
      const repo = new PrismaUrlRepository();

      const result = await repo.findByOriginalUrl("https://example.com");

      expect(result).toBeInstanceOf(ShortenedUrl);
      expect(result!.clicks).toBe(3);
    });

    it("returns null when not found", async () => {
      mockShortenedUrl.findUnique.mockResolvedValue(null);
      const repo = new PrismaUrlRepository();

      const result = await repo.findByOriginalUrl("https://missing.com");

      expect(result).toBeNull();
    });
  });

  describe("findByCode", () => {
    it("returns the entity when found", async () => {
      mockShortenedUrl.findUnique.mockResolvedValue(baseRecord);
      const repo = new PrismaUrlRepository();

      const result = await repo.findByCode("abc1234");

      expect(result).toBeInstanceOf(ShortenedUrl);
    });

    it("returns null when not found", async () => {
      mockShortenedUrl.findUnique.mockResolvedValue(null);
      const repo = new PrismaUrlRepository();

      const result = await repo.findByCode("missing");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("returns all URLs ordered by creation date descending", async () => {
      const records = [baseRecord, { ...baseRecord, id: "id-2", shortCode: "xyz5678" }];
      mockShortenedUrl.findMany.mockResolvedValue(records);
      const repo = new PrismaUrlRepository();

      const result = await repo.findAll();

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ShortenedUrl);
      expect(mockShortenedUrl.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns empty array when there are no records", async () => {
      mockShortenedUrl.findMany.mockResolvedValue([]);
      const repo = new PrismaUrlRepository();

      const result = await repo.findAll();

      expect(result).toEqual([]);
    });
  });
});
