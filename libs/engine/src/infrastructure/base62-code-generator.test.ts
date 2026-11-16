import { describe, expect, it } from "vitest";
import { Base62CodeGenerator } from "./base62-code-generator";

describe("Base62CodeGenerator", () => {
  it("generates a 7-character Base62 code across many values", () => {
    const generator = new Base62CodeGenerator();

    for (let i = 0; i < 100; i++) {
      expect(generator.generate()).toMatch(/^[A-Za-z0-9]{7}$/);
    }
  });
});
