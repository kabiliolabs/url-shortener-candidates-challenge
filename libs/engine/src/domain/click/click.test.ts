import { describe, expect, it } from "vitest";
import { ShortCode } from "../short-link/short-code";
import { Click } from "./click";

describe("Click", () => {
  const occurredAt = new Date("2026-01-01T10:00:00.000Z");

  it("references the short link by code only", () => {
    const shortCode = ShortCode.create("aaaaaaa");
    const click = Click.record({ shortCode, occurredAt });

    expect(click.shortCode.equals(shortCode)).toBe(true);
    expect(click.occurredAt).toEqual(occurredAt);
  });

  it("exposes primitives", () => {
    const click = Click.record({ shortCode: ShortCode.create("aaaaaaa"), occurredAt });
    expect(click.toPrimitives()).toEqual({ shortCode: "aaaaaaa", occurredAt });
  });

  it("is rebuilt from trusted parts without validation", () => {
    const click = new Click(new ShortCode("legacy-code"), occurredAt);
    expect(click.toPrimitives()).toEqual({ shortCode: "legacy-code", occurredAt });
  });
});
