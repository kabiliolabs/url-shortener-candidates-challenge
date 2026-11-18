import { Form, Link, useActionData } from "react-router";
import type { Route } from "./+types/_index";
import {
  baseUrl,
  createShortUrlUseCase,
  InvalidUrlError,
} from "@url-shortener/engine";

export function loader() {
  return {
    baseUrl: baseUrl ? baseUrl + "/s/" : "-",
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawUrl = formData.get("url");

  const value = typeof rawUrl === "string" ? rawUrl : "";

  try {
    const shortened = await createShortUrlUseCase.execute({
      originalUrl: value,
    });

    return {
      shortenedUrl: `${baseUrl ?? ""}/s/${shortened.shortCode}`,
    };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return { error: error.message, value };
    }

    throw error;
  }
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl } = loaderData;
  const actionData = useActionData<typeof action>();

  const error =
    actionData && "error" in actionData ? actionData.error : undefined;
  const shortenedUrl =
    actionData && "shortenedUrl" in actionData
      ? actionData.shortenedUrl
      : undefined;
  const previousValue =
    actionData && "value" in actionData ? actionData.value : "";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <header className="text-center">
          <p className="text-xs font-semibold tracking-[0.35em] text-moss uppercase dark:text-sage">
            URL Shortener
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-forest sm:text-5xl dark:text-cream">
            Short links, simply.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-forest/85 dark:text-cream/85">
            Paste a long URL and get a clean link worth sharing.
          </p>
        </header>

        <div className="mt-10 rounded-2xl border border-sage/60 bg-cream p-8 shadow-sm dark:border-sage/25 dark:bg-cream/5">
          <Form method="post" className="flex flex-col gap-4">
            <label
              htmlFor="url"
              className="text-sm font-medium text-forest dark:text-cream"
            >
              Your URL
            </label>
            <input
              id="url"
              type="text"
              name="url"
              placeholder="https://example.com/a/very/long/link"
              defaultValue={previousValue}
              aria-invalid={!!error}
              aria-describedby={error ? "url-error" : "url-hint"}
              required
              className="w-full rounded-xl border border-sage bg-cream px-4 py-3 text-base text-forest transition placeholder:text-moss focus:border-moss focus:ring-2 focus:ring-moss/30 focus:outline-none dark:bg-forest/40 dark:text-cream dark:placeholder:text-sage dark:focus:border-sage dark:focus:ring-sage/30"
            />

            <button
              type="submit"
              className="w-full rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-cream transition hover:bg-moss focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:bg-cream dark:text-forest dark:hover:bg-sage dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
            >
              Shorten URL
            </button>

            <p
              id="url-hint"
              className="text-center text-xs text-moss dark:text-sage"
            >
              Short links start with{" "}
              <span className="font-mono">{baseUrl}</span>
            </p>
          </Form>

          {error && (
            <p
              id="url-error"
              className="mt-5 rounded-xl border border-moss/40 bg-moss/10 px-4 py-3 text-sm text-forest dark:border-sage/30 dark:bg-sage/10 dark:text-cream"
            >
              {error}
            </p>
          )}

          {shortenedUrl && (
            <div className="mt-6 border-t border-sage/50 pt-6 dark:border-sage/20">
              <p className="text-xs font-semibold tracking-widest text-moss uppercase dark:text-sage">
                Your short link
              </p>
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-mono text-lg font-medium break-all text-forest underline decoration-sage decoration-2 underline-offset-4 transition hover:text-moss dark:text-cream dark:hover:text-sage"
              >
                {shortenedUrl}
              </a>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/stats"
            className="inline-flex items-center gap-1 text-sm font-medium text-moss transition hover:text-forest focus:outline-none focus-visible:ring-2 focus-visible:ring-moss focus-visible:ring-offset-2 focus-visible:ring-offset-cream dark:text-sage dark:hover:text-cream dark:focus-visible:ring-sage dark:focus-visible:ring-offset-forest"
          >
            View click statistics <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
