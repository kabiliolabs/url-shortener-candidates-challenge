import { Form } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";

type Props = {
  glassCardClassName: string;
  isSubmitting: boolean;
  actionData?: { ok: true; shortenedUrl?: string } | { ok: false; error: string };
};

export function CreateShortLinkCard({ glassCardClassName, isSubmitting, actionData }: Props) {
  return (
    <Card className={glassCardClassName}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Create a short link</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <Form method="post" className="flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="intent" value="create" />
          <Input
            name="url"
            type="url"
            placeholder="https://example.com/very/long/url"
            required
          />
          <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
            {isSubmitting ? "Shortening..." : "Shorten"}
          </Button>
        </Form>

        {actionData?.ok === true && actionData.shortenedUrl && (
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              className="break-all font-medium underline underline-offset-4"
              href={actionData.shortenedUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {actionData.shortenedUrl}
            </a>

            <Button
              type="button"
              variant="secondary"
              className="cursor-pointer"
              onClick={() => navigator.clipboard.writeText(actionData.shortenedUrl!)}
            >
              Copy
            </Button>
          </div>
        )}

        {actionData?.ok === false && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
            {actionData.error}
          </div>
        )}

      </CardContent>
    </Card>
  );
}
