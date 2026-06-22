import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { getUrlRepository } from "~/.server/container";

export async function loader({ params, request }: Route.LoaderArgs) {
  const { code } = params;
  const repo = getUrlRepository();
  const target = await repo.findByCode(code);

  if (!target) {
    throw new Response("Short link not found", { status: 404 });
  }

  // Record the click, but never let a stats failure block the redirect — the
  // user-facing behaviour (reaching their destination) takes priority over
  // analytics.
  try {
    await repo.recordClick(target.id, {
      referer: request.headers.get("referer"),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (error) {
    console.error("Failed to record click", error);
  }

  return redirect(target.originalUrl);
}
