import { data, Form, useNavigation } from "react-router";
import type { Route } from "./+types/_index";
import { UrlValidationError } from "@url-shortener/engine";
import { shortenUrl } from "~/.server/container";
import { shortLinkFor } from "~/.server/config";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const field = formData.get("url");
  const input = typeof field === "string" ? field : "";

  try {
    const shortUrl = await shortenUrl.execute(input);
    return {
      shortLink: shortLinkFor(shortUrl.shortCode),
      originalUrl: shortUrl.originalUrl,
    };
  } catch (error) {
    if (error instanceof UrlValidationError) {
      return data({ error: error.message, input }, { status: 400 });
    }
    console.error("Failed to shorten URL", error);
    return data(
      { error: "Something went wrong. Please try again.", input },
      { status: 500 },
    );
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const error = actionData && "error" in actionData ? actionData : null;
  const result = actionData && "shortLink" in actionData ? actionData : null;

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        Shorten a URL
      </h1>

      <Form method="post" className="flex flex-col gap-2" noValidate>
        <label htmlFor="url" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Long URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="url"
            type="url"
            name="url"
            placeholder="https://example.com/a/very/long/path"
            defaultValue={error?.input}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "url-error" : "url-notice"}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 aria-invalid:border-red-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Shortening…" : "Shorten"}
          </button>
        </div>
        {error && (
          <p id="url-error" role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error.error}
          </p>
        )}
        <p id="url-notice" className="text-xs text-gray-500 dark:text-gray-400">
          Shortened links are listed publicly. Don't shorten private URLs.
        </p>
      </Form>

      {result && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <p className="text-sm text-green-800 dark:text-green-300">Your short link:</p>
          <a
            href={result.shortLink}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-lg text-blue-700 underline dark:text-blue-400"
          >
            {result.shortLink}
          </a>
          <p className="mt-1 break-all text-xs text-gray-600 dark:text-gray-400">
            → {result.originalUrl}
          </p>
        </div>
      )}
    </main>
  );
}
