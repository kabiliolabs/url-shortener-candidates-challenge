import { describe, expect, it } from "vitest";
import { LIST_LIMIT, listShortLinks } from "./list-short-links";
import { InMemoryShortLinkRepository } from "../testing/in-memory-short-link-repository";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe("listShortLinks", () => {
  it("returns the newest links first, limited to 20", async () => {
    const repository = new InMemoryShortLinkRepository();
    const total = LIST_LIMIT + 1;

    for (let index = 0; index < total; index++) {
      await repository.create({
        url: `https://example.com/${index}`,
        code: `code${index.toString().padStart(3, "0")}`,
      });
      await wait(2);
    }

    const links = await listShortLinks(repository);

    expect(links).toHaveLength(LIST_LIMIT);
    expect(links[0]?.url).toBe(`https://example.com/${total - 1}`);
    expect(links[1]?.url).toBe(`https://example.com/${total - 2}`);
    expect(links.some((link) => link.url === "https://example.com/0")).toBe(
      false,
    );
  });
});