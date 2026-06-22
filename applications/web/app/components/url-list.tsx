import { useState } from "react";
import { Button } from "./ui/button";

export interface UrlListItem {
  code: string;
  originalUrl: string;
  shortUrl: string;
  clickCount: number;
  lastClickedAt: string | null;
  createdAt: string;
}

/** Copies a value to the clipboard and briefly confirms it in the label. */
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

/** Table of shortened URLs with their click statistics, or an empty state. */
export function UrlList({ urls }: { urls: UrlListItem[] }) {
  if (urls.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)] py-8 text-center">
        No links yet. Shorten your first URL above.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-muted-foreground)]">
            <th className="py-2 pr-4 font-medium">Short link</th>
            <th className="py-2 pr-4 font-medium">Original</th>
            <th className="py-2 pr-4 font-medium text-right">Clicks</th>
            <th className="py-2 pr-4 font-medium">Last click</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {urls.map((u) => (
            <tr
              key={u.code}
              className="border-b border-[var(--color-border)] last:border-0"
            >
              <td className="py-3 pr-4">
                <a
                  href={u.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
                >
                  /s/{u.code}
                </a>
              </td>
              <td
                className="py-3 pr-4 max-w-[22rem] truncate text-[var(--color-muted-foreground)]"
                title={u.originalUrl}
              >
                {u.originalUrl}
              </td>
              <td className="py-3 pr-4 text-right tabular-nums">{u.clickCount}</td>
              <td className="py-3 pr-4 text-[var(--color-muted-foreground)]">
                {u.lastClickedAt
                  ? new Date(u.lastClickedAt).toLocaleString()
                  : "—"}
              </td>
              <td className="py-3 text-right">
                <CopyButton value={u.shortUrl} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
