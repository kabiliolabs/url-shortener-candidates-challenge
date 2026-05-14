import { describe, it, expect, vi } from "vitest";
import { TrackClickUseCase } from "./track-click.use-case";
import type { UrlRepository } from "../domain/url-repository";

function makeRepository(overrides: Partial<UrlRepository> = {}): UrlRepository {
  return {
    save: vi.fn(),
    findByCode: vi.fn(),
    incrementClicks: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn(),
    ...overrides,
  };
}

describe("TrackClickUseCase", () => {
  it("calls incrementClicks with the given code", async () => {
    const repository = makeRepository();
    const useCase = new TrackClickUseCase(repository);

    await useCase.execute("abc1234");

    expect(repository.incrementClicks).toHaveBeenCalledOnce();
    expect(repository.incrementClicks).toHaveBeenCalledWith("abc1234");
  });
});
