import { describe, expect, it } from "vitest";
import { InvalidDestinationUrlError } from "./invalid-destination-url.error";
import { InvalidShortCodeError } from "./invalid-short-code.error";

describe("validation errors", () => {
  it("InvalidShortCodeError carries its reason", () => {
    const error = new InvalidShortCodeError("too short");
    expect(error.reason).toBe("too short");
    expect(error.name).toBe("InvalidShortCodeError");
  });

  it("InvalidDestinationUrlError carries its reason", () => {
    const error = new InvalidDestinationUrlError("bad scheme");
    expect(error.reason).toBe("bad scheme");
    expect(error.name).toBe("InvalidDestinationUrlError");
  });
});
