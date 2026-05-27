import { useState } from "react";
import { Button } from "./ui/button";
import { Callout } from "./ui/callout";

interface ShortenedUrlResultProps {
  shortenedUrl?: string;
}

type CopyState = "idle" | "copied" | "failed";

export function ShortenedUrlResult({
  shortenedUrl,
}: ShortenedUrlResultProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  if (!shortenedUrl) {
    return null;
  }

  async function copyShortenedUrl() {
    if (!shortenedUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <Callout className="grid gap-3" variant="success">
      <div className="grid gap-1">
        <p className="font-medium">Short URL created</p>
        <a
          className="break-all font-mono text-sm text-emerald-800 underline-offset-4 hover:underline"
          href={shortenedUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          {shortenedUrl}
        </a>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={copyShortenedUrl} size="sm" type="button">
          {copyState === "copied" ? "Copied" : "Copy"}
        </Button>
        <Button asChild size="sm" variant="secondary">
          <a href={shortenedUrl} rel="noopener noreferrer" target="_blank">
            Open
          </a>
        </Button>
      </div>
      {copyState === "failed" && (
        <p className="text-sm text-emerald-900" role="status">
          Copy failed. Select the URL manually.
        </p>
      )}
    </Callout>
  );
}
