import { useEffect, useState } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";

interface ShortLinkResultProps {
  shortenedUrl: string;
  destination: string;
}

type CopyState = "idle" | "copied" | "failed";

const COPY_LABELS: Record<CopyState, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

export function ShortLinkResult({
  shortenedUrl,
  destination,
}: ShortLinkResultProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  useEffect(() => {
    setCopyState("idle");
  }, [shortenedUrl]);

  useEffect(() => {
    if (copyState === "idle") return;
    const timeout = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [copyState]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <Card role="status" className="flex flex-col gap-3 border-indigo-200 bg-indigo-50">
      <p className="text-sm font-medium text-slate-900">Your short link</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={shortenedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-base font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
        >
          {shortenedUrl}
        </a>
        <Button variant="secondary" onClick={copy} className="sm:w-32">
          {COPY_LABELS[copyState]}
        </Button>
      </div>
      <p className="break-all text-sm text-slate-600">
        Redirects to {destination}
      </p>
      <Link
        to="/links"
        className="text-sm font-medium text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
      >
        View all links
      </Link>
    </Card>
  );
}
