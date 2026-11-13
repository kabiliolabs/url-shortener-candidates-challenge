import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/urls";
import {
  baseUrl,
  InvalidDestinationUrlError,
  normalizeDestinationUrl,
} from "@url-shortener/engine";
import { Button, ButtonLink } from "../components/button";
import { FeedbackMessage } from "../components/feedback-message";
import { PageLayout } from "../components/page-layout";
import { shortenedUrlService } from "../services/shortened-url.server";

const pageSize = 20;

/** Valida el filtro y carga una página de enlaces con sus datos de presentación. */
export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const rawSearch = (searchParams.get("q") ?? "").trim();
  let search = "";
  let searchError: string | null = null;

  if (rawSearch) {
    try {
      search = normalizeDestinationUrl(rawSearch);
    } catch (error) {
      if (!(error instanceof InvalidDestinationUrlError)) {
        throw error;
      }

      return {
        search: rawSearch,
        searchError: error.message,
        page: 1,
        totalCount: 0,
        totalPages: 1,
        shortenedUrls: [],
      };
    }
  }

  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const result = await shortenedUrlService.listShortenedUrls({
    search,
    page,
    pageSize,
  });

  return {
    search,
    searchError,
    page: result.currentPage,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
    shortenedUrls: result.shortenedUrls.map(
      ({ code, originalUrl, createdAt, clickCount }) => ({
        code,
        originalUrl,
        shortUrl: `${baseUrl?.replace(/\/$/, "") ?? ""}/s/${code}`,
        createdAt: createdAt.toISOString(),
        clickCount,
      }),
    ),
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shortened URLs" },
    { name: "description", content: "Browse shortened URLs and click counts" },
  ];
}

const createdAtFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Muestra búsqueda, estadísticas y navegación paginada de los enlaces. */
export default function Urls({ loaderData }: Route.ComponentProps) {
  const {
    shortenedUrls,
    search,
    searchError,
    page,
    totalCount,
    totalPages,
  } = loaderData;
  const navigation = useNavigation();
  const isLoading =
    navigation.state !== "idle" &&
    navigation.location?.pathname === "/urls";
  const isSearching = isLoading && navigation.formMethod === "GET";

  /** Conserva el filtro al construir la URL de la página solicitada. */
  function getPageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (search) {
      params.set("q", search);
    }
    params.set("page", String(targetPage));
    return `/urls?${params.toString()}`;
  }

  return (
    <PageLayout
      title="Links and statistics"
      description="Browse your shortened links and their activity."
      maxWidth="6xl"
      action={<ButtonLink to="/">Shorten a URL</ButtonLink>}
    >
      <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
        <Form method="get" className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label
              htmlFor="url-search"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Search destination URLs
            </label>
            <input
              id="url-search"
              type="url"
              name="q"
              defaultValue={search}
              placeholder="https://example.com"
              autoComplete="url"
              aria-invalid={Boolean(searchError)}
              aria-describedby={`search-hint${searchError ? " search-error" : ""}`}
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:opacity-60"
            />
            <p id="search-hint" className="mt-2 text-sm text-slate-400">
              Enter a complete HTTP or HTTPS URL.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Button
              type="submit"
              loading={isSearching}
              loadingLabel="Searching..."
            >
              Search
            </Button>
            {search && (
              <ButtonLink to="/urls" variant="secondary">
                Clear
              </ButtonLink>
            )}
          </div>
        </Form>
      </section>

      {searchError && (
        <FeedbackMessage id="search-error" tone="error" className="mb-6">
          {searchError}
        </FeedbackMessage>
      )}

      {isLoading && !isSearching && (
        <FeedbackMessage tone="info" className="mb-6">
          Loading results...
        </FeedbackMessage>
      )}

      <div aria-busy={isLoading}>
        {searchError ? null : shortenedUrls.length === 0 ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <h2 className="text-xl font-semibold">
              {search ? "No matching URLs" : "No links yet"}
            </h2>
            <p className="mt-2 text-slate-300">
              {search
                ? "Try another search or clear the current filter."
                : "Shorten a URL to see it and its click statistics here."}
            </p>
          </section>
        ) : (
          <>
            <p className="mb-3 text-sm text-slate-300" aria-live="polite">
              {totalCount} {totalCount === 1 ? "URL" : "URLs"}
              {search ? ` matching “${search}”` : ""}
            </p>
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-slate-800/80 text-sm uppercase tracking-wide text-slate-300">
                  <tr>
                    <th scope="col" className="px-5 py-4">
                      Destination
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Short link
                    </th>
                    <th scope="col" className="px-5 py-4 text-right">
                      Clicks
                    </th>
                    <th scope="col" className="px-5 py-4">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {shortenedUrls.map((url) => (
                    <tr key={url.code} className="align-top">
                      <td className="max-w-md px-5 py-4">
                        <a
                          href={url.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-cyan-200 underline decoration-cyan-700 underline-offset-4 hover:text-white"
                        >
                          {url.originalUrl}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={url.shortUrl}
                          className="font-mono text-cyan-200 underline decoration-cyan-700 underline-offset-4 hover:text-white"
                        >
                          {url.shortUrl}
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums">
                        {url.clickCount}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-300">
                        <time dateTime={url.createdAt}>
                          {createdAtFormatter.format(new Date(url.createdAt))}
                          {" UTC"}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {totalPages > 1 && !searchError && (
          <nav
            aria-label="URL list pagination"
            className="mt-6 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <ButtonLink
                to={getPageUrl(page - 1)}
                variant="secondary"
                rel="prev"
              >
                Previous
              </ButtonLink>
            ) : (
              <Button variant="secondary" disabled>
                Previous
              </Button>
            )}
            <span className="text-sm text-slate-300">
              Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
              <ButtonLink
                to={getPageUrl(page + 1)}
                variant="secondary"
                rel="next"
              >
                Next
              </ButtonLink>
            ) : (
              <Button variant="secondary" disabled>
                Next
              </Button>
            )}
          </nav>
        )}
      </div>
    </PageLayout>
  );
}
