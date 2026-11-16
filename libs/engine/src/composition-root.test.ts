import { describe, expect, it } from "vitest";
import { createShortenerApp } from "./composition-root";

describe("createShortenerApp", () => {
  it("instantiates all three use cases without error", () => {
    const app = createShortenerApp();

    expect(app.shortenUrl).toBeDefined();
    expect(app.resolveAndTrackClick).toBeDefined();
    expect(app.listUrlsWithStats).toBeDefined();
  });
});
