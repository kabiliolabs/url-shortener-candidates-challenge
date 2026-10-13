import { Form, data, useActionData, useNavigation } from "react-router";
import { type FormEvent, useState } from "react";
import type { Route } from "./+types/_index";
import {
  InvalidDestinationUrlError,
  InvalidShortCodeError,
  ShortCodeGenerationExhaustedError,
} from "@url-shortener/engine";
import { services } from "../server/container.server";
import { ConfirmDialog } from "../components/confirm-dialog";
import { getDisplayedShortUrl, getPublicUrl, getShortUrl } from "../server/public-url.server";

const requestsByClient = new Map<string, number[]>();

export async function loader() {
  const urls = await services.listShortUrls.execute();

  return {
    baseUrl: `${getPublicUrl()}/s/`,
    urls: urls.map((url) => ({
      ...url,
      displayUrl: getDisplayedShortUrl(url.originalUrl, url.code),
      href: getShortUrl(url.code),
    })),
    clickEvents: await Promise.all(
      urls.map(async (url) => ({
        code: url.code,
        events: await services.listClickEvents.execute({ code: url.code }),
      })),
    ),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "create");

  if (intent === "delete") {
    const code = String(formData.get("code") ?? "");

    try {
      const deleted = await services.deleteShortUrl.execute({ code });
      return deleted
        ? { deleted: true }
        : data({ error: "That short URL no longer exists." }, { status: 404 });
    } catch (error) {
      if (error instanceof InvalidShortCodeError) {
        return data({ error: error.message }, { status: 400 });
      }

      return data({ error: "We could not delete that short URL." }, { status: 500 });
    }
  }

  const client = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const now = Date.now();
  const recentRequests = (requestsByClient.get(client) ?? []).filter((time) => now - time < 60_000);
  if (recentRequests.length >= 20) {
    return data(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 },
    );
  }
  requestsByClient.set(client, [...recentRequests, now]);

  const url = String(formData.get("url") ?? "");
  try {
    const record = await services.createShortUrl.execute({ originalUrl: url });

    return {
      shortenedUrl: getShortUrl(record.code),
      displayUrl: getDisplayedShortUrl(record.originalUrl, record.code),
    };
  } catch (error) {
    if (error instanceof InvalidDestinationUrlError) {
      return data({ error: error.message }, { status: 400 });
    }

    if (error instanceof ShortCodeGenerationExhaustedError) {
      return data(
        { error: "We could not generate a unique short URL. Please try again." },
        { status: 409 },
      );
    }

    return data(
      { error: "We could not create that short URL. Please try again." },
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
  const { baseUrl, urls, clickEvents } = loaderData;
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const actionError = actionData && "error" in actionData ? actionData.error : undefined;
  const shortenedUrl = actionData && "shortenedUrl" in actionData ? actionData.shortenedUrl : undefined;
  const displayedShortUrl = actionData && "displayUrl" in actionData ? actionData.displayUrl : shortenedUrl;

  function validateBeforeSubmit(event: FormEvent<HTMLFormElement>) {
    const value = String(new FormData(event.currentTarget).get("url") ?? "").trim();

    if (!value) {
      event.preventDefault();
      setClientError("Enter a URL before shortening it.");
      return;
    }

    if (!/^https?:\/\//i.test(value)) {
      event.preventDefault();
      setClientError("The URL is missing http:// or https://.");
      return;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error();
      }
      setClientError(null);
    } catch {
      event.preventDefault();
      setClientError("Enter a valid URL starting with http:// or https://.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">URL management</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Short links, clear insights.</h1>
          <p className="mt-3 max-w-2xl text-slate-600">Create durable short links and keep an eye on their usage.</p>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <Form method="post" noValidate className="flex flex-col gap-3 sm:flex-row" onSubmit={validateBeforeSubmit}>
            <div className="min-w-0 flex-1">
              <label htmlFor="url" className="sr-only">Long URL</label>
              <input id="url" type="url" name="url" placeholder="https://example.com/your-long-url" required onChange={() => setClientError(null)} aria-invalid={Boolean(clientError)} aria-describedby={clientError ? "url-error" : undefined}
                className={`w-full rounded-lg border px-4 py-3 outline-none transition focus:ring-2 focus:ring-indigo-100 ${clientError ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-indigo-500"}`} />
            </div>
            <button type="submit" disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {isSubmitting ? "Creating…" : "Shorten URL"}
            </button>
          </Form>
          <p className="mt-3 text-sm text-slate-500">Short links start with {baseUrl}</p>
          {clientError && <p id="url-error" role="alert" className="mt-3 border-t border-red-100 pt-3 text-sm text-red-700">{clientError}</p>}
          {actionError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</p>}
          {shortenedUrl && <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            <span className="font-semibold">Created: </span>
            <span className="break-all">{displayedShortUrl}</span>
          </div>}
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-semibold">Your links</h2><span className="text-sm text-slate-500">{urls.length} total</span></div>
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            {urls.length === 0 ? <p className="p-6 text-slate-500">No links yet. Create your first one above.</p> : <div className="divide-y divide-slate-100">
              {urls.map((url) => {
                const events = clickEvents.find((item) => item.code === url.code)?.events ?? [];

                return <details key={url.code} className="group border-b border-slate-100 p-5 last:border-b-0">
                  <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0"><a className="font-semibold text-indigo-700 hover:underline" href={url.href}>{url.displayUrl}</a><p className="truncate text-sm text-slate-500">{url.originalUrl}</p></div>
                    <div className="flex items-center gap-5 text-sm text-slate-600"><span><strong className="text-slate-900">{url.clicks}</strong> clicks</span><time dateTime={url.createdAt.toISOString()}>{url.createdAt.toLocaleDateString()}</time><svg className="h-5 w-5 text-indigo-600 transition-transform group-open:rotate-180" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                  </summary>
                  <div className="mt-4 rounded-lg bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-700">Click history</h3>
                    {events.length === 0 ? <p className="mt-2 text-sm text-slate-500">No clicks yet.</p> : <ul className="mt-2 space-y-2 text-sm text-slate-600">{events.map((event, index) => <li key={`${event.clickedAt.toISOString()}-${index}`}>{event.clickedAt.toLocaleString()}</li>)}</ul>}
                  </div>
                  <div className="mt-4"><button type="button" onClick={() => setDeleteCode(url.code)} className="font-semibold text-red-600 transition hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2" aria-label={`Delete ${url.code}`}>Delete</button></div>
                </details>;
              })}
            </div>}
          </div>
        </section>
      </div>
      <ConfirmDialog
        open={deleteCode !== null}
        title="Delete short URL?"
        description="This action permanently removes the short URL and its click history."
        onCancel={() => setDeleteCode(null)}
      >
        <Form method="post" onSubmit={() => setDeleteCode(null)}>
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="code" value={deleteCode ?? ""} />
          <button type="submit" className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Delete</button>
        </Form>
      </ConfirmDialog>
    </main>
  );
}
