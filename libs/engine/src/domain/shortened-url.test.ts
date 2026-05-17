import { describe, it, expect } from "vitest";
import { ShortenedUrl } from "./shortened-url";
import { OriginalUrl } from "./original-url";

describe("ShortenedUrl.create", () => {
  it("creates with 0 clicks and a generated short code", () => {
    const url = ShortenedUrl.create("id-1", OriginalUrl.create("https://example.com"));
    expect(url.clicks).toBe(0);
    expect(url.shortCode.value).toHaveLength(7);
    expect(url.id).toBe("id-1");
  });

  it("sets createdAt to now", () => {
    const before = new Date();
    const url = ShortenedUrl.create("id-1", OriginalUrl.create("https://example.com"));
    const after = new Date();
    expect(url.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(url.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});

describe("ShortenedUrl.incrementClicks", () => {
  it("returns a new instance with clicks + 1", () => {
    const url = ShortenedUrl.create("id-1", OriginalUrl.create("https://example.com"));
    const updated = url.incrementClicks();
    expect(updated.clicks).toBe(1);
    expect(url.clicks).toBe(0);
  });

  it("preserves all other fields", () => {
    const url = ShortenedUrl.create("id-1", OriginalUrl.create("https://example.com"));
    const updated = url.incrementClicks();
    expect(updated.id).toBe(url.id);
    expect(updated.shortCode.value).toBe(url.shortCode.value);
    expect(updated.originalUrl.value).toBe(url.originalUrl.value);
  });
});
