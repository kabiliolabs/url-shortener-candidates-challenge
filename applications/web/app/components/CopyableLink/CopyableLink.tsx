import { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const COPIED_RESET_MS = 2000;

export interface CopyableLinkProps {
  href: string;
  displayText?: string;
  onCopy?: (text: string) => void | Promise<void>;
}

export function CopyableLink({
  href,
  displayText = href,
  onCopy,
}: CopyableLinkProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      if (onCopy) {
        await onCopy(href);
      } else {
        await navigator.clipboard.writeText(href);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all font-mono text-[0.95rem] text-primary-light no-underline hover:underline"
      >
        {displayText}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy"}
        className="rounded p-1 text-primary hover:bg-white/10"
      >
        <ContentCopyIcon fontSize="small" />
      </button>
      {copied && (
        <span className="text-xs text-success">Copied!</span>
      )}
    </div>
  );
}
