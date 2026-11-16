import { describe, expect, it } from "vitest";
import { withSecurityHeaders } from "./security-headers";

const ALLOWED_ORIGIN = "https://app.example";

function respondTo(origin?: string) {
  const request = new Request("https://api.example/api/urls", {
    headers: origin ? { Origin: origin } : {},
  });
  return withSecurityHeaders(new Response("ok"), request, ALLOWED_ORIGIN);
}

describe("withSecurityHeaders", () => {
  it("grants CORS to the configured frontend origin", () => {
    const response = respondTo(ALLOWED_ORIGIN);

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(ALLOWED_ORIGIN);
    expect(response.headers.get("Vary")).toContain("Origin");
  });

  it("does not grant CORS to any other origin", () => {
    expect(
      respondTo("https://evil.example").headers.get("Access-Control-Allow-Origin"),
    ).toBeNull();
    expect(respondTo().headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("sets standard security headers on every response", () => {
    const { headers } = respondTo();

    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=");
  });
});
