import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type ShortenedUrlDisplayProps = {
  shortenedUrl: string;
};

export function ShortenedUrlDisplay({ shortenedUrl }: ShortenedUrlDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (): Promise<void> => {
    await navigator.clipboard.writeText(shortenedUrl);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your shortened URL</CardTitle>
        <CardDescription>Share this link or copy it to your clipboard.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={shortenedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 break-all font-mono text-sm text-primary underline-offset-4 hover:underline"
        >
          {shortenedUrl}
        </a>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={copyToClipboard}
        >
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardContent>
    </Card>
  );
}
