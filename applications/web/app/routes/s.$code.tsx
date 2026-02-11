import { redirect } from "react-router";
import { findByCode, incrementClicks } from "~/server/short-url.repository";
import type { Route } from "./+types/s.$code";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Missing code", { status: 400 });
  }

  const found = await findByCode(code);


  if (!found) {
    throw new Response("Not Found", { status: 404 });
  }

  await incrementClicks(found.id);

  return redirect(found.originalUrl, { status: 302 });
}
