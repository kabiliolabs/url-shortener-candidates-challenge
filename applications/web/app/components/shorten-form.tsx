import { Check, Copy, Loader2 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useActionData, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

// The action answers with this shape for every outcome, so nothing here has to
// guess which keys exist. `invalidUrl` is true only when the input itself was
// rejected; a server failure leaves it false.
export type ShortenResult = {
  shortenedUrl: string | null;
  error: string | null;
  invalidUrl: boolean;
};

export function ShortenForm({ shortUrlBase }: { shortUrlBase: string }) {
  // A fetcher instead of <Form>: the result stays in this component, the URL
  // does not change, and the list below revalidates by itself after a success.
  const fetcher = useFetcher<ShortenResult>();
  const formRef = useRef<HTMLFormElement>(null);
  const inputId = useId();
  const errorId = useId();
  const hintId = useId();

  // Before JavaScript loads (or without it) the browser submits the form as a
  // normal page request, and the outcome arrives as action data instead.
  const actionData = useActionData<ShortenResult>();

  const isSubmitting = fetcher.state !== "idle";
  const result = fetcher.data ?? actionData;
  const error = result?.error ?? null;

  useEffect(() => {
    if (fetcher.state === "idle" && result?.shortenedUrl) {
      formRef.current?.reset();
    }
  }, [fetcher.state, result]);

  return (
    <div className="flex flex-col gap-4">
      {/* noValidate: the messages come from the domain, so they are the same in
          every browser and cover rules the browser does not know about. */}
      <fetcher.Form
        ref={formRef}
        method="post"
        noValidate
        className="flex flex-col gap-2"
      >
        <label htmlFor={inputId} className="text-sm font-medium">
          Long URL
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id={inputId}
            name="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/a/very/long/link"
            // Only a rejected input marks the field. After a server error the
            // value may be fine, so the field must not look wrong.
            aria-invalid={result?.invalidUrl || undefined}
            aria-describedby={error ? `${errorId} ${hintId}` : hintId}
            className="h-10"
          />
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="h-10 px-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Shortening…
              </>
            ) : (
              "Shorten"
            )}
          </Button>
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <p id={hintId} className="text-sm text-muted-foreground">
          Your short link will start with{" "}
          <span className="font-mono">{shortUrlBase}</span>
        </p>
      </fetcher.Form>

      {result?.shortenedUrl && (
        // Keyed by URL so the "Copied" state resets when a new link is created.
        <ShortenedUrl key={result.shortenedUrl} url={result.shortenedUrl} />
      )}
    </div>
  );
}

function ShortenedUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // The Clipboard API is unavailable on insecure origins or when permission
      // is denied. The link stays on screen and can be selected by hand.
    }
  }

  return (
    <div
      role="status"
      className="flex flex-col gap-2 rounded-lg border bg-muted/50 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Your short link</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block truncate font-mono text-base font-medium underline-offset-4 hover:underline"
        >
          {url}
        </a>
      </div>
      <Button type="button" variant="outline" onClick={copy}>
        {copied ? (
          <>
            <Check aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy aria-hidden="true" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
