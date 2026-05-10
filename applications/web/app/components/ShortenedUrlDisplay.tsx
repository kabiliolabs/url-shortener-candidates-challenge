import { Alert, CopyButton } from "~/components/ui";

interface ShortenedUrlDisplayProps {
  url: string;
}

export function ShortenedUrlDisplay({ url }: ShortenedUrlDisplayProps) {
  return (
    <Alert variant="success" className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Shortened URL:</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="link link-hover font-mono text-sm break-all"
        >
          {url}
        </a>
      </div>
      <CopyButton text={url} label="Copy" />
    </Alert>
  );
}
