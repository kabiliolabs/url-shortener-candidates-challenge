import { Link, data, isRouteErrorResponse, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { UrlNotFoundError } from "@url-shortener/engine";
import { urlShortener } from "../lib/container.server";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    // Resolving also counts the click.
    const url = await urlShortener.resolve(params.code);
    return redirect(url.originalUrl);
  } catch (error) {
    if (error instanceof UrlNotFoundError) {
      throw data("Short link not found", { status: 404 });
    }
    throw error;
  }
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md space-y-3 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {notFound ? "Link not found" : "Something went wrong"}
        </h1>
        <p className="text-slate-600">
          {notFound
            ? "This short link doesn't exist or may have been mistyped."
            : "We couldn't open this link. Please try again in a moment."}
        </p>
        <Link to="/" className="inline-block text-indigo-600 hover:underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}