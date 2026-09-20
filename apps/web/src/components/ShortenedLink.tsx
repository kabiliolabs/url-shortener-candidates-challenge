import * as Tooltip from "@radix-ui/react-tooltip";
import { useState } from "react";

type ShortenedLinkProps = {
  shortUrl: string;
  onReset: () => void;
};

export default function ShortenedLink({ shortUrl, onReset }: ShortenedLinkProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard?.writeText(shortUrl);
    setCopied(true);
  };

  return (
    <section className="result" aria-live="polite">
      <div>
        <span className="result-label">Your short link</span>
        <a href={shortUrl} target="_blank" rel="noreferrer">{shortUrl}</a>
      </div>
      <div className="result-actions">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button type="button" onClick={copyLink}>{copied ? "Copied" : "Copy"}</button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="tooltip-content" sideOffset={8}>
              Copy this short link
              <Tooltip.Arrow className="tooltip-arrow" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        <button className="text-button" type="button" onClick={onReset}>Shorten another</button>
      </div>
    </section>
  );
}
