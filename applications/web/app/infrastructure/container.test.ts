import { describe, it, expect, vi } from "vitest";
import { ShortenUrlUseCase, TrackClickUseCase, ListUrlsUseCase } from "@url-shortener/engine";

vi.mock("./prisma-url-repository", () => ({
  PrismaUrlRepository: class {
    save = vi.fn();
    incrementClicks = vi.fn();
    findByCode = vi.fn();
    findByOriginalUrl = vi.fn();
    findAll = vi.fn();
  },
}));

vi.mock("./shorten-rate-limiter", () => ({
  shortenRateLimiter: { isAllowed: vi.fn().mockReturnValue(true) },
}));

import { makeShortenUrlUseCase, makeTrackClickUseCase, makeListUrlsUseCase } from "./container";

describe("container", () => {
  it("makeShortenUrlUseCase returns a ShortenUrlUseCase", () => {
    expect(makeShortenUrlUseCase()).toBeInstanceOf(ShortenUrlUseCase);
  });

  it("makeTrackClickUseCase returns a TrackClickUseCase", () => {
    expect(makeTrackClickUseCase()).toBeInstanceOf(TrackClickUseCase);
  });

  it("makeListUrlsUseCase returns a ListUrlsUseCase", () => {
    expect(makeListUrlsUseCase()).toBeInstanceOf(ListUrlsUseCase);
  });
});
