import { Check, Copy } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type CopyShortUrlButtonProps = {
  url: string;
  className?: string;
};

export function CopyShortUrlButton({ url, className }: CopyShortUrlButtonProps) {
  const errorId = useId();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  async function handleCopy() {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Could not copy — select the link and copy manually.");
      window.setTimeout(() => setCopyError(null), 5000);
    }
  }

  return (
    <div className={cn("flex shrink-0 flex-col items-end gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy shortened URL"}
        aria-describedby={copyError ? errorId : undefined}
      >
        {copied ? (
          <Check className="size-4" aria-hidden />
        ) : (
          <Copy className="size-4" aria-hidden />
        )}
        {copied ? "Copied" : "Copy"}
      </Button>
      {copyError ? (
        <p
          id={errorId}
          role="alert"
          className="max-w-[14rem] text-right text-xs text-destructive"
        >
          {copyError}
        </p>
      ) : null}
    </div>
  );
}
