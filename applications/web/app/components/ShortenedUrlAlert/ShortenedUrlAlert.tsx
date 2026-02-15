import { CopyableLink } from "../CopyableLink";

export interface ShortenedUrlAlertProps {
  url: string;
  onCopy?: (text: string) => void | Promise<void>;
}

export function ShortenedUrlAlert({ url, onCopy }: ShortenedUrlAlertProps): React.JSX.Element {
  return (
    <section
      className="mt-6 w-full rounded border border-[var(--color-success-border)] bg-[var(--color-success-muted)] p-4"
      aria-label="Shortened URL result"
    >
      <p className="mb-2 text-sm font-medium text-success">Your shortened URL</p>
      <CopyableLink href={url} onCopy={onCopy} />
      <p className="mt-2 text-xs text-text-secondary">
        Share this link or open it in a new tab to test the redirect.
      </p>
    </section>
  );
}
