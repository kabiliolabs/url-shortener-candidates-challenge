import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { data, Form, Link, useNavigation } from "react-router";
import { shortenUrl } from "~/.server/container";
import { shortUrlFor } from "~/.server/env";
import { getClientId, toHttpError } from "~/.server/http";
import { CopyButton } from "~/components/copy-button";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { Route } from "./+types/_index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shorten a link · URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

// React Router only forwards action headers (like Retry-After on a 429) if the route opts in.
export function headers({ actionHeaders }: Route.HeadersArgs) {
  return actionHeaders;
}

/** Thin adapter: read the form, call the use case, map the result (SPEC-001). */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const url = String(formData.get("url") ?? "");

  try {
    const created = await shortenUrl.execute({ url, clientId: getClientId(request) });
    return { ok: true as const, shortUrl: shortUrlFor(created.code), originalUrl: created.originalUrl };
  } catch (error) {
    const { status, message, headers } = toHttpError(error);
    return data({ ok: false as const, error: message }, { status, headers });
  }
}

export default function Index({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);
  const error = actionData && !actionData.ok ? actionData.error : undefined;

  // Clear the input after a success, but keep it on errors so the user can fix it (SPEC-008).
  useEffect(() => {
    if (actionData?.ok) formRef.current?.reset();
  }, [actionData]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Shorten a long link</CardTitle>
          <CardDescription>Paste a URL and get a short link you can share.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" ref={formRef} noValidate className="flex flex-col gap-2">
            <Label htmlFor="url">URL</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="url"
                name="url"
                inputMode="url"
                autoComplete="off"
                placeholder="https://example.com/a/very/long/link"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "url-error" : undefined}
                className="h-10"
              />
              <Button type="submit" disabled={isSubmitting} className="h-10 px-4">
                {isSubmitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
                {isSubmitting ? "Shortening..." : "Shorten"}
              </Button>
            </div>
            {error ? (
              <p id="url-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </Form>
        </CardContent>
      </Card>

      {actionData?.ok ? (
        <Card>
          <CardHeader>
            <CardTitle>Your short link is ready</CardTitle>
            <CardDescription className="truncate" title={actionData.originalUrl}>
              {actionData.originalUrl}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={actionData.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              {actionData.shortUrl}
            </a>
            <CopyButton value={actionData.shortUrl} />
          </CardContent>
        </Card>
      ) : null}

      <Link
        to="/stats"
        className="inline-flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        See all links and their clicks <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}
