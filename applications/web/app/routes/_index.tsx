import { useEffect, useRef } from "react";
import { Form, useActionData, useNavigation, data } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError } from "@url-shortener/engine";
import { baseUrl } from "../.server/config";
import { createShortUrl } from "../.server/short-url";
import {
  createShortUrlRateLimiter,
  getClientIp,
} from "../.server/rate-limit";
import { SiteHeader } from "../components/site-header";
import { Card } from "../components/card";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { CopyButton } from "../components/copy-button";

type ActionData = {
  shortenedUrl?: string;
  fieldError?: string;
  formError?: string;
};

export function loader() {
  return { shortBaseUrl: `${baseUrl}/s/` };
}

export async function action({ request }: Route.ActionArgs) {
  if (!createShortUrlRateLimiter.tryConsume(getClientIp(request))) {
    return data<ActionData>(
      {
        formError:
          "Too many requests. Please slow down and try again shortly.",
      },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const url = (formData.get("url") ?? "").toString().trim();

  if (!url) {
    return data<ActionData>({ fieldError: "URL is required" }, { status: 400 });
  }

  try {
    const created = await createShortUrl({ url });
    const result: ActionData = { shortenedUrl: `${baseUrl}/s/${created.code}` };
    return result;
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return data<ActionData>(
        { fieldError: "Please enter a valid http:// or https:// URL." },
        { status: 400 },
      );
    }
    console.error("Failed to create short URL", error);
    return data<ActionData>(
      { formError: "Something went wrong. Please try again." },
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

export default function Index({ loaderData }: Route.ComponentProps) {
  const { shortBaseUrl } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = navigation.state === "submitting";
  const showResult = Boolean(actionData?.shortenedUrl) && !isSubmitting;

  useEffect(() => {
    if (actionData?.shortenedUrl) {
      formRef.current?.reset();
    }
  }, [actionData]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-5 py-16 sm:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-104 w-xl max-w-[110vw] -translate-x-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(127,86,217,0.20),rgba(127,86,217,0.06)_55%,transparent)] blur-2xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 -z-10 h-80 w-md max-w-[90vw] -translate-x-[15%] rounded-full bg-[radial-gradient(closest-side,rgba(90,111,236,0.18),rgba(90,111,236,0.05)_55%,transparent)] blur-2xl"
        />
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-mono text-sm font-medium text-brand-600">
            <span aria-hidden className="h-2 w-2 rounded-full bg-sun-400" />
            URL shortener
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Shorten any link.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Paste a long URL and get a short, shareable link you can track.
          </p>
        </div>

        <Card className="mt-10 p-6 sm:p-8">
          {actionData?.formError && (
            <Alert className="mb-5">{actionData.formError}</Alert>
          )}
          <Form
            ref={formRef}
            method="post"
            replace
            className="flex flex-col gap-5"
          >
            <Input
              label="Long URL"
              name="url"
              type="text"
              inputMode="url"
              autoComplete="off"
              spellCheck={false}
              placeholder="https://example.com/articles/the-very-long-slug"
              required
              error={actionData?.fieldError}
              hint={`Short links start with ${shortBaseUrl}`}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:self-start sm:px-6"
            >
              {isSubmitting ? "Shortening…" : "Shorten link"}
            </Button>
          </Form>
        </Card>

        {showResult && actionData?.shortenedUrl && (
          <ShortLinkResult url={actionData.shortenedUrl} />
        )}
      </main>
    </div>
  );
}

function ShortLinkResult({ url }: { url: string }) {
  return (
    <Card
      role="status"
      aria-live="polite"
      className="mt-6 border-brand-200 bg-linear-to-br from-brand-50 to-white p-6"
    >
      <p className="flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wide text-brand-700">
        <span aria-hidden className="h-2 w-2 rounded-full bg-sun-400" />
        Your short link
      </p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all font-mono text-lg font-medium text-brand-700 underline-offset-4 hover:underline"
        >
          {url}
        </a>
        <CopyButton value={url} className="shrink-0" />
      </div>
    </Card>
  );
}
