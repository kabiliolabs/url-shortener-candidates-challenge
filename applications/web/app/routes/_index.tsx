import { Link, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import { ShortenFormCard } from "~/components/layout/ShortenFormCard";
import { ShortenOutcomePanels } from "~/components/layout/ShortenOutcomePanels";
import {
  getShortenedUrlPrefixFromEnv,
  handleShortenUrlAction,
} from "~/server/http-shorten-url";

export function loader() {
  return {
    baseUrl: getShortenedUrlPrefixFromEnv(),
  };
}

export async function action({ request }: Route.ActionArgs) {
  return handleShortenUrlAction(request);
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl: baseUrlPrefix } = loaderData;
  const actionData = useActionData<typeof action>();
  const shortenedUrl =
    actionData && "shortenedUrl" in actionData ? actionData.shortenedUrl : null;
  const errorMessage =
    actionData && "error" in actionData ? actionData.error : null;

  return (
    <main className="flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-14 sm:px-6 lg:py-20">
        <header className="mb-10 space-y-4 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Shorten any link
          </h1>
          <p className="mx-auto max-w-md text-pretty text-muted-foreground">
            Turn long URLs into compact links. Perfect for messages, docs, and
            social posts.
          </p>
        </header>

        <div className="space-y-8">
          <ShortenFormCard baseUrl={baseUrlPrefix} />
          <ShortenOutcomePanels
            shortenedUrl={shortenedUrl}
            errorMessage={errorMessage}
          />
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          <Link
            to="/stats"
            reloadDocument
            className="font-medium text-foreground underline-offset-4 hover:underline transition-colors"
          >
            View click statistics →
          </Link>
        </p>
      </div>
    </main>
  );
}
