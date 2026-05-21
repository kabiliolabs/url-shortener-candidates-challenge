import {
  CodeCollisionError,
  InvalidUrlError,
  RateLimitExceededError,
} from "@url-shortener/engine";
import { type ActionFunctionArgs, data } from "react-router";
import { assertCsrf } from "~/lib/csrf.server";
import { getEngine } from "~/lib/engine.server";

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "anonymous";
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await assertCsrf(request, formData);

  const rawUrl = formData.get("url");
  const engine = getEngine();

  try {
    const result = await engine.shortenUrl({
      url: typeof rawUrl === "string" ? rawUrl : "",
      clientIp: getClientIp(request),
    });
    return { shortenedUrl: result.shortUrl };
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return data({ error: err.reason }, { status: 400 });
    }
    if (err instanceof RateLimitExceededError) {
      return data(
        { error: `Too many requests — try again in ${err.retryAfterSeconds}s.` },
        { status: 429, headers: { "Retry-After": String(err.retryAfterSeconds) } },
      );
    }
    if (err instanceof CodeCollisionError) {
      return data(
        { error: "Could not generate a unique short code — please try again." },
        { status: 503 },
      );
    }
    throw err;
  }
}
