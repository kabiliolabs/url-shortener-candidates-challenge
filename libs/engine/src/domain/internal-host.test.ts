import { describe, expect, it } from "vitest";
import { DestinationUrl } from "./destination-url";
import { InvalidUrlError } from "./errors";
import { isInternalHost } from "./internal-host";

describe("isInternalHost (SSRF guard)", () => {
  it.each([
    ["169.254.169.254", "cloud metadata endpoint"],
    ["127.0.0.1", "loopback"],
    ["10.1.2.3", "private class A"],
    ["172.16.0.1", "private class B"],
    ["172.31.255.255", "private class B, upper bound"],
    ["192.168.1.1", "private class C"],
    ["0.0.0.0", "this network"],
    ["100.64.0.1", "CGNAT"],
    ["224.0.0.1", "multicast"],
    ["localhost", "loopback name"],
    ["db.internal", "internal TLD"],
    ["printer.local", "mDNS"],
    ["metadata.google.internal", "GCP metadata"],
    ["[::1]", "IPv6 loopback"],
    ["[fd00::1]", "IPv6 unique local"],
    ["[fe80::1]", "IPv6 link-local"],
    ["[::ffff:127.0.0.1]", "IPv4-mapped loopback"],
  ])("blocks %s (%s)", (hostname) => {
    expect(isInternalHost(hostname)).toBe(true);
  });

  it.each(["example.com", "8.8.8.8", "172.32.0.1", "192.169.1.1", "99.1.2.3"])(
    "allows the public host %s",
    (hostname) => {
      expect(isInternalHost(hostname)).toBe(false);
    },
  );

  it("rejects internal targets through DestinationUrl", () => {
    for (const url of [
      "http://169.254.169.254/latest/meta-data/",
      "http://localhost:8080/admin",
      "https://10.0.0.5/internal",
      "http://[::1]:3000",
    ]) {
      expect(() => DestinationUrl.parse(url)).toThrow(InvalidUrlError);
    }
  });

  // The WHATWG URL parser normalises these to 127.0.0.1 before we see them,
  // which is why the guard only needs to understand dotted-quad notation.
  it("is not fooled by decimal or hex notations of a private address", () => {
    expect(() => DestinationUrl.parse("http://2130706433/")).toThrow(InvalidUrlError);
    expect(() => DestinationUrl.parse("http://0x7f000001/")).toThrow(InvalidUrlError);
  });
});
