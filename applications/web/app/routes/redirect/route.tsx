import { redirect } from "react-router";
import type { Route } from "./+types/route";
import { resolveShortenedURL } from "../../bootstrap.server";

export async function loader({ params }: Route.LoaderArgs) {
  const result = await resolveShortenedURL.execute(params.code);

  if (!result.ok) {
    throw new Response(result.error.message, {
      status:
        result.error.code === "storage_unavailable"
          ? 503
          : result.error.code === "not_found"
            ? 404
            : 400,
    });
  }

  return redirect(result.value);
}
