import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const FEEDBACK_RESET_MS = 2000;

type CopyState = "idle" | "copied" | "failed";

const COPY_FEEDBACK: Record<CopyState, string> = {
  idle: "",
  copied: "Copied to clipboard",
  failed: "Couldn't copy automatically. Select the link and copy it manually.",
};

export function ResultCard({ shortUrl }: { shortUrl: string }) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }
    const timeout = setTimeout(() => setCopyState("idle"), FEEDBACK_RESET_MS);
    return () => clearTimeout(timeout);
  }, [copyState]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your short link is ready</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
            {shortUrl}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={shortUrl} target="_blank" rel="noopener noreferrer">
                Open
              </a>
            </Button>
            <Button onClick={copy}>{copyState === "copied" ? "Copied!" : "Copy"}</Button>
          </div>
        </div>
        <p
          role="status"
          className={copyState === "failed" ? "text-sm text-destructive" : "text-sm text-success"}
        >
          {COPY_FEEDBACK[copyState]}
        </p>
      </CardContent>
    </Card>
  );
}
