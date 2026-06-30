import { describe, expect, it } from "vitest";
import { createCodeGenerator, DEFAULT_CODE_LENGTH } from "./code-generator";
import { ShortCode } from "../domain/value-objects/short-code";

describe("createCodeGenerator", () => {
  it("produces codes of the default length", () => {
    const code = createCodeGenerator().generate();
    expect(code).toHaveLength(DEFAULT_CODE_LENGTH);
  });

  it("produces codes accepted by ShortCode validation", () => {
    const code = createCodeGenerator().generate();
    expect(() => ShortCode.create(code)).not.toThrow();
  });
});
