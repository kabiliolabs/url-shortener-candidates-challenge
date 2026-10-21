import { data, isRouteErrorResponse, Link, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { ShortenedUrlNotFoundError } from "@url-shortener/engine";
import { resolveShortenedUrl } from "~/container.server";
import { Card, CardBody } from "~/components/ui/card";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    // Resolving also records the click (single use case, single DB round trip).
    const shortenedUrl = await resolveShortenedUrl.execute(params.code);

    return redirect(shortenedUrl.destination.value, {
      // 302, never 301: a permanent redirect gets cached by browsers and
      // proxies, and every cached hit is a click we would never see again.
      status: 302,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        // Do not leak the original long URL to the destination site.
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    if (error instanceof ShortenedUrlNotFoundError) {
      throw data({ message: error.message }, { status: 404 });
    }
    throw error;
  }
}

/**
 * Route-level error boundary: a real 404 page instead of the generic template
 * error. A toast/snackbar is not an option here — a redirect is a full server
 * navigation, so there is no client state left to show one in.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-4">
      <Card className="w-full">
        <CardBody className="text-center">
          <p className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
            {isRouteErrorResponse(error) ? error.status : 500}
          </p>
          <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {isNotFound ? "This link does not exist" : "Something went wrong"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {isNotFound
              ? "The short link you followed is expired, mistyped, or was never created."
              : "We could not resolve this link right now. Please try again."}
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            Shorten a new link
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
