import { describe, expect, expectTypeOf, it } from "vitest";
import { Err, Ok } from "./result";
import type { Result } from "./result";

describe("Result", () => {
  it("constructs success and failure values with the shared contract", () => {
    expect(Ok(42)).toEqual({ ok: true, value: 42 });
    expect(Err({ code: "invalid" })).toEqual({
      ok: false,
      error: { code: "invalid" },
    });
  });

  it("narrows values and errors using ok", () => {
    const results: Result<number, string>[] = [Ok(42), Err("invalid")];

    expect(
      results.map((result) => {
        if (result.ok) {
          expectTypeOf(result.value).toEqualTypeOf<number>();
          return result.value.toString();
        }
        expectTypeOf(result.error).toEqualTypeOf<string>();
        return result.error;
      }),
    ).toEqual(["42", "invalid"]);
  });
});
