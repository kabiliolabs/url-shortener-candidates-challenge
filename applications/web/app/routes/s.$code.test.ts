// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loader } from "./s.$code";

const mockGetCachedUrl = vi.fn<(code: string) => Promise<string | null>>(() => Promise.resolve(null));
const mockSetCachedUrl = vi.fn<(code: string, value: string) => Promise<void>>(() => Promise.resolve());
const mockRecordClick = vi.fn((_id: number, _metadata: unknown) => Promise.resolve());
const mockResolveShortCode = vi.fn((code: string, _repo?: unknown) => {
  if (code === "abc123") {
    return Promise.resolve({
      id: 1,
      shortCode: "abc123",
      originalUrl: "https://example.com",
      createdAt: new Date(),
    });
  }
  return Promise.resolve(null);
});

vi.mock("~/server/services/cache.service.server", () => ({
  getCachedUrl: (code: string) => mockGetCachedUrl(code),
  setCachedUrl: (code: string, value: string) => mockSetCachedUrl(code, value),
}));

vi.mock("~/server/services/url.service.server", () => ({
  resolveShortCode: (code: string, repo: unknown) => mockResolveShortCode(code, repo),
}));

vi.mock("~/server/repositories/index.server", () => ({
  urlRepository: {},
  clickRepository: {
    recordClick: (id: number, metadata: unknown) => mockRecordClick(id, metadata),
  },
}));

vi.mock("~/server/lib/logger.server", () => ({
  logger: { error: vi.fn() },
}));

function makeLoaderArgs(code: string) {
  const request = new Request(`http://localhost/s/${code}`);
  return {
    params: { code },
    request,
    context: {} as never,
    url: new URL(request.url),
    pattern: "/s/:code",
  } as any;
}

describe("s.$code route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCachedUrl.mockResolvedValue(null);
  });

  it("redirects to original URL on cache miss (DB hit)", async () => {
    const response = await loader(makeLoaderArgs("abc123"));

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://example.com");
    expect(mockGetCachedUrl).toHaveBeenCalledWith("abc123");
    expect(mockResolveShortCode).toHaveBeenCalled();
    expect(mockSetCachedUrl).toHaveBeenCalledWith(
      "abc123",
      JSON.stringify({ id: 1, originalUrl: "https://example.com" }),
    );
    expect(mockRecordClick).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it("redirects to original URL on cache hit (skips DB)", async () => {
    mockGetCachedUrl.mockResolvedValue(
      JSON.stringify({ id: 42, originalUrl: "https://cached.example.com" }),
    );

    const response = await loader(makeLoaderArgs("abc123"));

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe("https://cached.example.com");
    expect(mockGetCachedUrl).toHaveBeenCalledWith("abc123");
    expect(mockResolveShortCode).not.toHaveBeenCalled();
    expect(mockSetCachedUrl).not.toHaveBeenCalled();
    expect(mockRecordClick).toHaveBeenCalledWith(42, expect.any(Object));
  });

  it("throws 404 for unknown code", async () => {
    const args = makeLoaderArgs("nonexistent");
    await expect(loader(args)).rejects.toBeInstanceOf(Response);

    try {
      await loader(makeLoaderArgs("nonexistent"));
      expect.fail("Expected loader to throw");
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(404);
    }
  });

  it("does not cache 404s", async () => {
    try {
      await loader(makeLoaderArgs("nonexistent"));
    } catch {
      // expected
    }
    expect(mockSetCachedUrl).not.toHaveBeenCalled();
  });

  it("tracks clicks on both cache hit and miss", async () => {
    // Cache miss path
    await loader(makeLoaderArgs("abc123"));
    expect(mockRecordClick).toHaveBeenCalledTimes(1);

    vi.clearAllMocks();

    // Cache hit path
    mockGetCachedUrl.mockResolvedValue(
      JSON.stringify({ id: 1, originalUrl: "https://example.com" }),
    );
    await loader(makeLoaderArgs("abc123"));
    expect(mockRecordClick).toHaveBeenCalledTimes(1);
  });
});
