import { resolveCode } from "@url-shortener/engine";
import { data, redirect } from "react-router";
import { NotFoundPage } from "~/not-found-page";
import { shortLinkRepository } from "~/infrastructure/prisma/prisma-short-link-repository.server";
import type { Route } from "./+types/s.$code";

export async function loader({ params }: Route.LoaderArgs) {
  const url = await resolveCode(shortLinkRepository, params.code);

  if (!url) {
    return data(null, { status: 404 });
  }

  return redirect(url, 302);
}

export default function UnknownCode() {
  return <NotFoundPage />;
}
