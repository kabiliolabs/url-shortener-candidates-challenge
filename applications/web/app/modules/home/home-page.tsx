import { Form } from "react-router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { CopyButton } from "../../components/ui/copy-button";
import { FormField } from "../../components/ui/form-field";
import { Notice } from "../../components/ui/notice";
import type { HomePageState } from "./contracts";

const recentDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function HomePage({ state }: { state: HomePageState }) {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-4">
            <h1 className="max-w-2xl font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {state.hero.title}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-neutral-400">{state.hero.description}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Base path" value={state.summary.baseUrl} />
              <StatTile label="Recent URLs" value={String(state.summary.recentUrlCount)} />
              <StatTile label="Tracked clicks" value={String(state.summary.trackedClicks)} />
            </div>
          </div>

          <Card
            eyebrow="Create"
            title="Shorten a new URL"
            description="Paste any HTTP or HTTPS destination. The API validates the input and returns a ready-to-share short link."
          >
            <Form method="post" className="space-y-5">
              <FormField
                type="url"
                name="url"
                label="Destination URL"
                placeholder="https://example.com/article"
                required
                defaultValue={state.form.inputValue}
                disabled={state.form.isSubmitting}
                error={state.form.error}
                hint={`Short links are created under ${state.form.baseUrl}`}
                leadingVisual={<LinkGlyph />}
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button type="submit" disabled={state.form.isSubmitting} aria-busy={state.form.isSubmitting} className="sm:min-w-44">
                  {state.form.isSubmitting ? "Creating short URL..." : "Create short URL"}
                </Button>
                <p className="text-sm text-neutral-500">{state.form.helperText}</p>
              </div>
            </Form>
          </Card>
        </section>

        <LatestShortUrlCard result={state.result} />

        <RecentUrlsCard recentUrls={state.recentUrls} />
      </div>
    </main>
  );
}

function LatestShortUrlCard({ result }: Pick<HomePageState, "result">) {
  return (
    <Card
      eyebrow="Results"
      title="Latest created short URL"
      description="Copy the generated link or open it in a new tab to validate the redirect flow."
    >
      {result.shortenedUrl ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/10 bg-white p-4 text-black">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Short URL</p>
            <a
              href={result.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block break-all font-[var(--font-display)] text-xl text-black"
            >
              {result.shortenedUrl}
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            <CopyButton value={result.shortenedUrl} />
            <a
              href={result.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800"
            >
              Open short URL
            </a>
          </div>
        </div>
      ) : result.fallbackShortUrl ? (
        <div className="space-y-4">
          <Notice tone="info">
            Your newest result will appear here after a successful request. In the meantime, the most recent stored URL is shown below.
          </Notice>
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4">
            <span className="break-all text-sm font-medium text-neutral-800">{result.fallbackShortUrl}</span>
            <CopyButton value={result.fallbackShortUrl} />
          </div>
        </div>
      ) : (
        <Notice tone="info">Create your first short URL to see a shareable result here.</Notice>
      )}
    </Card>
  );
}

function RecentUrlsCard({ recentUrls }: Pick<HomePageState, "recentUrls">) {
  return (
    <Card
      eyebrow="Statistics"
      title="Recent URLs"
      description="A live view of recently created short links, their targets, and click counts from the backend."
    >
      {recentUrls.error ? (
        <Notice tone="error">{recentUrls.error}</Notice>
      ) : recentUrls.items.length === 0 ? (
        <Notice tone="info">No URLs have been shortened yet.</Notice>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 bg-white px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Listing</p>
              <p className="mt-1 text-sm text-neutral-600">Your most recent shortened URLs, with destination and click count.</p>
            </div>
            <span className="rounded-full border border-black/10 px-3 py-1 text-sm font-medium text-black">
              {recentUrls.items.length} items
            </span>
          </div>

          <ul className="grid gap-4 md:grid-cols-2">
            {recentUrls.items.map((url) => (
              <li key={url.code} className="rounded-[1.75rem] border border-black/10 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Short URL</p>
                    <a
                      href={url.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all font-[var(--font-display)] text-lg text-black hover:text-neutral-700"
                    >
                      {url.shortUrl}
                    </a>
                  </div>
                  <CopyButton value={url.shortUrl} />
                </div>

                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Destination</dt>
                    <dd className="mt-1 break-all text-sm leading-6 text-neutral-700">{url.url}</dd>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-neutral-800">
                      {url.clicks} clicks
                    </div>
                    <div className="rounded-full border border-black/10 px-3 py-1.5 text-sm text-neutral-500">
                      {recentDateFormatter.format(new Date(url.createdAt))}
                    </div>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-black/10 bg-white p-5 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      <p className="mt-3 break-all font-[var(--font-display)] text-2xl font-bold text-black">{value}</p>
    </div>
  );
}

function LinkGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M10.5 13.5L13.5 10.5M8.172 15.828l-1.344 1.344a3 3 0 104.243 4.242l1.343-1.343M15.828 8.172l1.344-1.344a3 3 0 10-4.243-4.242L11.586 3.93"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}