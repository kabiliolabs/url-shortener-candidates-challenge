import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ShortLinkResult } from "~/components/short-link-result";

export interface ShortenResult {
  shortenedUrl: string;
  destination: string;
}

type ShortenActionData = ShortenResult | { error: string };

export function ShortenForm({ baseUrl }: { baseUrl: string }) {
  const fetcher = useFetcher<ShortenActionData>();
  const formRef = useRef<HTMLFormElement>(null);
  const isSubmitting = fetcher.state !== "idle";
  const data = fetcher.data;
  const error = data && "error" in data ? data.error : null;
  const result = data && "shortenedUrl" in data ? data : null;

  useEffect(() => {
    if (result) formRef.current?.reset();
  }, [result]);

  return (
    <div className="flex flex-col gap-4">
      <fetcher.Form
        ref={formRef}
        method="post"
        action="/?index"
        className="flex flex-col gap-2"
      >
        <label htmlFor="url" className="text-sm font-medium text-slate-900">
          Destination URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="url"
            name="url"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            placeholder="example.com/a/very/long/url"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "url-error" : "url-hint"}
          />
          <Button type="submit" disabled={isSubmitting} className="sm:w-40">
            {isSubmitting ? "Shortening…" : "Shorten"}
          </Button>
        </div>
        {error ? (
          <p id="url-error" role="alert" className="text-sm text-red-700">
            {error}
          </p>
        ) : (
          <p id="url-hint" className="text-sm text-slate-600">
            Short links look like {baseUrl}abc123
          </p>
        )}
      </fetcher.Form>
      {result && <ShortLinkResult {...result} />}
    </div>
  );
}
