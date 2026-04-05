import { Link2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { CopyShortUrlButton } from "~/components/layout/CopyShortUrlButton";
import { cn } from "~/lib/utils";

type ShortenOutcomePanelsProps = {
  shortenedUrl: string | null;
  errorMessage: string | null;
  className?: string;
};

export function ShortenOutcomePanels({
  shortenedUrl,
  errorMessage,
  className,
}: ShortenOutcomePanelsProps) {
  if (!shortenedUrl && !errorMessage) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {shortenedUrl && (
        <Alert className="border-primary/25 bg-primary/5">
          <Link2 className="size-4" aria-hidden />
          <AlertTitle>Your short link is ready</AlertTitle>
          <AlertDescription className="space-y-3 pt-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 break-all font-mono text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {shortenedUrl}
              </a>
              <CopyShortUrlButton url={shortenedUrl} />
            </div>
            <p className="text-xs text-muted-foreground">
              Opens in a new tab. Use Copy to paste the link elsewhere.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t shorten that URL</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
