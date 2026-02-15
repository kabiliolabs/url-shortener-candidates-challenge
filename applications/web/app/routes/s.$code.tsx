import type { Route } from "./+types/s.$code";
import { loadShortCodeRedirect } from "../loaders/short-code.server.js";

export async function loader({ params }: Route.LoaderArgs) {
  return loadShortCodeRedirect(params.code);
}
