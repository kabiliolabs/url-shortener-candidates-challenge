import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { ShortLinkNotFoundError } from "@url-shortener/engine/application";
import { container } from "~/.server/container";

const MAX_CODE_LENGTH = 64;
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/;

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (code.length > MAX_CODE_LENGTH || CONTROL_CHARACTERS.test(code)) {
    throw notFound();
  }

  try {
    const { destination } = await container.resolveShortLink.execute({ code });
    return redirect(destination, 302);
  } catch (error) {
    if (error instanceof ShortLinkNotFoundError) throw notFound();
    throw error;
  }
}
