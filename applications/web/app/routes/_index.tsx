import { useEffect, useRef, useState } from "react";
import { Form, useActionData, useNavigation, useRevalidator } from "react-router";
import type { Route } from "./+types/_index";
import { InvalidUrlError } from "@url-shortener/engine";
import { getBaseUrl } from "~/lib/base-url.server";
import { checkRateLimit, getClientKey } from "~/lib/rate-limit.server";
import { shortUrlService } from "~/lib/short-url-service.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/Spinner";
import { ShortUrlListItem } from "~/components/ShortUrlListItem";

export async function loader() {
  const urls = await shortUrlService.listShortUrls();
  return {
    baseUrl: getBaseUrl(),
    urls,
  };
}

export async function action({ request }: Route.ActionArgs) {
  if (!checkRateLimit(getClientKey(request)).allowed) {
    return { error: "Too many links submitted. Wait a minute and try again." };
  }

  const formData = await request.formData();
  const url = formData.get("url");

  if (typeof url !== "string" || url.length === 0) {
    return { error: "Paste a link to shorten." };
  }

  try {
    const { shortenedUrl } = await shortUrlService.createShortUrl(
      url,
      getBaseUrl(),
    );
    return { shortenedUrl };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return { error: error.message };
    }
    throw error;
  }
}

export function meta() {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Paste a link, get a short one back." },
  ];
}

function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-primary hover:text-stamp-hover"
    >
      {copied ? "Copied" : "Copy link"}
    </Button>
  );
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { baseUrl, urls } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const revalidator = useRevalidator();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleFocus() {
      revalidator.revalidate();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [revalidator]);

  useEffect(() => {
    if (actionData?.shortenedUrl) {
      formRef.current?.reset();
    }
  }, [actionData]);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <header className="mb-10">
        <h1 className="text-sm font-medium text-primary">URL Shortener</h1>
        <p className="mt-1 text-muted-foreground">
          Paste a link, get a short one back.
        </p>
      </header>

      <Form
        method="post"
        ref={formRef}
        className="flex flex-col gap-4 sm:flex-row sm:items-end"
      >
        <div className="w-full">
          <Label htmlFor="url">Link to shorten</Label>
          <Input
            id="url"
            type="text"
            name="url"
            placeholder="https://example.com/your-long-link"
            aria-invalid={actionData?.error ? true : undefined}
            aria-describedby={actionData?.error ? "url-error" : undefined}
            className={actionData?.error ? "mt-1.5 border-destructive" : "mt-1.5"}
            defaultValue=""
          />
          {actionData?.error && (
            <p id="url-error" className="mt-1.5 text-sm text-destructive">
              {actionData.error}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Shortening…" : "Shorten"}
        </Button>
      </Form>

      {actionData?.shortenedUrl && (
        <Card className="mt-6 border-dashed bg-kraft">
          <CardContent>
            <p className="text-sm text-muted-foreground">Your link is ready.</p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <a
                href={actionData.shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate font-mono text-base font-medium text-foreground hover:text-primary"
              >
                {actionData.shortenedUrl}
              </a>
              <CopyLinkButton link={actionData.shortenedUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      <section className="mt-14">
        <h2 className="text-sm text-muted-foreground">Your links</h2>

        {urls.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No links yet. Paste one above to get started.
          </p>
        ) : (
          <ul className="mt-4">
            {urls.map((shortUrl) => (
              <ShortUrlListItem
                key={shortUrl.id}
                shortUrl={shortUrl}
                baseUrl={baseUrl}
              />
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
