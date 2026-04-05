import { describe, expect, it, vi } from "vitest";

import { handleShortenUrlAction } from "../app/domain/url-shortener.server";
import { createInMemoryRepository } from "./helpers/in-memory-repository";

describe("collision handling in handleShortenUrlAction", () => {
  it("returns a user-facing error when all attempts fail", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "only", originalUrl: "https://a.com" });

    const formData = new FormData();
    formData.set("url", "https://example.com/page");
    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });

    const result = await handleShortenUrlAction(request, {
      currentBaseUrl: "http://test.example",
      createCode: () => "only",
      repository,
    });

    expect(result).toEqual({
      error: "Unable to shorten this URL right now. Please try again.",
    });
  });

  it("succeeds after a collision via the action handler", async () => {
    const repository = createInMemoryRepository();
    await repository.create({ code: "taken", originalUrl: "https://existing.com" });

    const codes = ["taken", "ok"];
    const formData = new FormData();
    formData.set("url", "https://example.com/page");
    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });

    const result = await handleShortenUrlAction(request, {
      currentBaseUrl: "http://test.example",
      createCode: () => codes.shift()!,
      repository,
    });

    expect(result).toEqual({ shortenedUrl: "http://test.example/s/ok" });
  });

  it("rethrows unexpected errors from the repository", async () => {
    const repository = createInMemoryRepository();
    const formData = new FormData();
    formData.set("url", "https://example.com/page");

    const request = new Request("http://test.example/", {
      method: "POST",
      body: formData,
    });

    const dbError = new Error("db offline");
    repository.create = vi.fn().mockRejectedValue(dbError);

    await expect(
      handleShortenUrlAction(request, {
        currentBaseUrl: "http://test.example",
        createCode: () => "any",
        repository,
      }),
    ).rejects.toThrow("db offline");
  });
});
