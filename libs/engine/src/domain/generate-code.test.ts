import { describe, expect, it } from "vitest";
import { generateCode } from "./generate-code";

describe("generateCode", () => {
  it("returns 7 characters from a-z0-9", () => {
    const code = generateCode();

    expect(code).toMatch(/^[a-z0-9]{7}$/);
  });
});
