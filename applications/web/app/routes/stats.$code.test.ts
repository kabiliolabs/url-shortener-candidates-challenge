// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockResolveShortCode = vi.fn();
const mockGetUrlClicksByDay = vi.fn();
const mockGetClickCountByUrlId = vi.fn();

vi.mock("~/server/services/url.service.server", () => ({
  resolveShortCode: (...args: unknown[]) => mockResolveShortCode(...args),
  getUrlClicksByDay: (...args: unknown[]) => mockGetUrlClicksByDay(...args),
}));

vi.mock("~/server/repositories/index.server", () => ({
  urlRepository: {},
  clickRepository: {
    getClickCountByUrlId: (...args: unknown[]) =>
      mockGetClickCountByUrlId(...args),
  },
}));

vi.mock("~/server/lib/logger.server", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { loader } from "./stats.$code";

function makeLoaderArgs(code: string) {
  const request = new Request(`http://localhost/stats/${code}`);
  return {
    params: { code },
    request,
    context: {} as never,
    url: new URL(request.url),
    pattern: "/stats/:code",
  } as any;
}

const mockUrl = {
  id: 1,
  shortCode: "abc123",
  originalUrl: "https://example.com",
  createdAt: new Date("2025-01-15"),
};

describe("stats.$code route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns URL data and click stats for valid code", async () => {
    mockResolveShortCode.mockResolvedValue(mockUrl);
    mockGetClickCountByUrlId.mockResolvedValue(42);
    mockGetUrlClicksByDay.mockResolvedValue([
      { date: "2025-01-15", count: 10 },
      { date: "2025-01-16", count: 5 },
    ]);

    const result = await loader(makeLoaderArgs("abc123"));

    expect(result).toHaveProperty("url");
    expect(result.url.shortCode).toBe("abc123");
    expect(result.url.originalUrl).toBe("https://example.com");
    expect(result).toHaveProperty("clickCount", 42);
    expect(result).toHaveProperty("dailyClicks");
    expect(result.dailyClicks).toHaveLength(2);
  });

  it("throws 404 for unknown code", async () => {
    mockResolveShortCode.mockResolvedValue(null);

    try {
      await loader(makeLoaderArgs("unknown"));
      expect.fail("Expected loader to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(404);
    }
  });

  it("returns empty daily clicks array when no clicks exist", async () => {
    mockResolveShortCode.mockResolvedValue(mockUrl);
    mockGetClickCountByUrlId.mockResolvedValue(0);
    mockGetUrlClicksByDay.mockResolvedValue([]);

    const result = await loader(makeLoaderArgs("abc123"));

    expect(result.clickCount).toBe(0);
    expect(result.dailyClicks).toEqual([]);
  });

  it("returns correct 30-day window", async () => {
    mockResolveShortCode.mockResolvedValue(mockUrl);
    mockGetClickCountByUrlId.mockResolvedValue(10);
    mockGetUrlClicksByDay.mockResolvedValue([]);

    await loader(makeLoaderArgs("abc123"));

    expect(mockGetUrlClicksByDay).toHaveBeenCalledWith(
      mockUrl.id,
      expect.anything(),
      30,
    );
  });

  it("returns url object with shortCode, originalUrl, and createdAt", async () => {
    mockResolveShortCode.mockResolvedValue(mockUrl);
    mockGetClickCountByUrlId.mockResolvedValue(5);
    mockGetUrlClicksByDay.mockResolvedValue([]);

    const result = await loader(makeLoaderArgs("abc123"));

    expect(result.url).toEqual({
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: mockUrl.createdAt,
    });
  });

  it("calls resolveShortCode with correct params", async () => {
    mockResolveShortCode.mockResolvedValue(mockUrl);
    mockGetClickCountByUrlId.mockResolvedValue(0);
    mockGetUrlClicksByDay.mockResolvedValue([]);

    await loader(makeLoaderArgs("xyz789"));

    expect(mockResolveShortCode).toHaveBeenCalledWith("xyz789", expect.anything());
  });
});
