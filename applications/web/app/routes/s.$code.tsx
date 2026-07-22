import { isRouteErrorResponse, Link, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { ShortUrlErrorView } from "../modules/short-url/error-view";
import { resolveShortCode, toShortCodeErrorResponse } from "../modules/short-url/server";

export async function loader({ params }: Route.LoaderArgs) {
  const { code } = params;

  if (!code) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    return await resolveShortCode(code);
  } catch (error) {
    throw toShortCodeErrorResponse(error);
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = "Unable to open short URL";
  let message = "The URL service could not complete this request.";
  let statusCode = "503";

  if (isRouteErrorResponse(error)) {
    statusCode = String(error.status);
    message = typeof error.data === "string" ? error.data : error.statusText;

    if (error.status === 404) {
      title = "Short URL not found";
    }
  }

  return <ShortUrlErrorView statusCode={statusCode} title={title} message={message} />;
}
