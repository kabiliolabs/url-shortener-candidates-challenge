import { describe, expect, it } from "vitest";
import { DestinationUrl } from "./destination-url";
import { ShortCode } from "./short-code";
import { ShortLink } from "./short-link";

const createdAt = new Date("2026-01-01T00:00:00.000Z");

describe("ShortLink", () => {
  it("is created from value objects", () => {
    const code = ShortCode.create("aaaaaaa");
    const destination = DestinationUrl.create("https://example.com");

    const link = ShortLink.create({ code, destination, createdAt });

    expect(link.code.equals(code)).toBe(true);
    expect(link.destination.equals(destination)).toBe(true);
    expect(link.createdAt).toEqual(createdAt);
  });

  it("is rebuilt from trusted parts without validation", () => {
    const link = new ShortLink(
      new ShortCode("legacy-code"),
      new DestinationUrl("ftp://legacy"),
      createdAt,
    );
    expect(link.toPrimitives()).toEqual({
      code: "legacy-code",
      destination: "ftp://legacy",
      createdAt,
    });
  });

  it("exposes primitives", () => {
    const link = ShortLink.create({
      code: ShortCode.create("aaaaaaa"),
      destination: DestinationUrl.create("https://example.com"),
      createdAt,
    });
    expect(link.toPrimitives()).toEqual({
      code: "aaaaaaa",
      destination: "https://example.com/",
      createdAt,
    });
  });
});
