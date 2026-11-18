import { data, redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { redirectUrlUseCase, UrlNotFoundError } from "@url-shortener/engine";
import { ErrorPage } from "~/components/error-page";

export async function loader({ params }: Route.LoaderArgs) {
  try {
    const shortened = await redirectUrlUseCase.execute(params.code);
    return redirect(shortened.originalUrl);
  } catch (error) {
    if (error instanceof UrlNotFoundError) {
      return data({ notFound: true }, { status: 404 });
    }

    throw error;
  }
}

export default function ShortCodeRedirect({ params }: Route.ComponentProps) {
  return (
    <ErrorPage
      status={404}
      title="Page not found"
      message={`The short link "${params.code}" doesn't exist or has been deleted.`}
    />
  );
}
