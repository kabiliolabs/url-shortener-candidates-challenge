import { describe, expect, it } from "vitest";
import { DomainError } from "./domain-error";

class SampleError extends DomainError {}

describe("DomainError", () => {
  it("uses the subclass name and keeps the message", () => {
    const error = new SampleError("boom");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe("SampleError");
    expect(error.message).toBe("boom");
  });
});
