import { randomBytes, timingSafeEqual } from "node:crypto";

import { createCookie } from "react-router";

const TOKEN_BYTES = 32;
const COOKIE_NAME = "_csrf";
const FORM_FIELD = "_csrf";
const ONE_DAY_SECONDS = 60 * 60 * 24;

const csrfCookie = createCookie(COOKIE_NAME, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: ONE_DAY_SECONDS,
});

export const CSRF_FORM_FIELD = FORM_FIELD;

export interface CsrfTokenResult {
  token: string;
  setCookieHeader: string | null;
}

export async function ensureCsrfToken(
  cookieHeader: string | null,
): Promise<CsrfTokenResult> {
  const existing = await csrfCookie.parse(cookieHeader);
  if (typeof existing === "string" && existing.length > 0) {
    return { token: existing, setCookieHeader: null };
  }
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const setCookieHeader = await csrfCookie.serialize(token);
  return { token, setCookieHeader };
}

export async function assertCsrf(request: Request, formData: FormData): Promise<void> {
  const cookieToken = await csrfCookie.parse(request.headers.get("Cookie"));
  const rawFormToken = formData.get(FORM_FIELD);
  const formToken = typeof rawFormToken === "string" ? rawFormToken : "";
  if (typeof cookieToken !== "string" || !cookieToken || !formToken) {
    throw new Response("Forbidden: missing CSRF token", { status: 403 });
  }
  const a = Buffer.from(cookieToken);
  const b = Buffer.from(formToken);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Response("Forbidden: invalid CSRF token", { status: 403 });
  }
}
