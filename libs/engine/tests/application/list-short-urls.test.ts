import { describe, expect, it } from "vitest";
import { ListShortUrls } from "../../src/application/use-cases/list-short-urls";
import { InMemoryUrlRepository } from "../helpers/in-memory-url-repository";

describe("ListShortUrls", () => {
  it("returns the newest records first without mutating repository data", async () => {
    const repository = new InMemoryUrlRepository();
    repository.seed({
      code: "older_01",
      originalUrl: "https://older.example.com",
      createdAt: new Date("2026-10-12T10:00:00.000Z"),
      clicks: 1,
    });
    repository.seed({
      code: "newer_01",
      originalUrl: "https://newer.example.com",
      createdAt: new Date("2026-10-13T10:00:00.000Z"),
      clicks: 2,
    });

    const result = await new ListShortUrls(repository).execute();

    expect(result.map(({ code }) => code)).toEqual(["newer_01", "older_01"]);
    expect((await repository.list()).map(({ code }) => code)).toEqual(["older_01", "newer_01"]);
  });
});
