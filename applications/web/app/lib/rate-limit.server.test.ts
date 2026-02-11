import { describe, expect, it } from "vitest";
import { rateLimitOrThrow } from "./rate-limit.server";

describe("rateLimitOrThrow", () => {
  it("allows requests under the limit", () => {
    expect(() => rateLimitOrThrow("1.1.1.1", 2, 60_000)).not.toThrow();
    expect(() => rateLimitOrThrow("1.1.1.1", 2, 60_000)).not.toThrow();
  });

  it("throws when exceeding the limit", () => {
    rateLimitOrThrow("2.2.2.2", 1, 60_000);
    expect(() => rateLimitOrThrow("2.2.2.2", 1, 60_000)).toThrow();
  });
});
