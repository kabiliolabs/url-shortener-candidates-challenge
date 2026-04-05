import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import {
  findShortenedUrlByCode,
  recordClickByCode,
} from "~/server/http-shorten-url";

export async function loader({ params }: Route.LoaderArgs) {
  const url = await findShortenedUrlByCode(params.code);

  if (!url) {
    throw new Response("Not Found", { status: 404 });
  }

  recordClickByCode(params.code!);

  return redirect(url);
}
