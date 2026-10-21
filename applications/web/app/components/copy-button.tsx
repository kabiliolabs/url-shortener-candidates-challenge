import { useState } from "react";
import { Button } from "./ui/button";

/**
 * Copy-to-clipboard with optimistic feedback. The whole point of the product is
 * handing the user a link, and previously they had to select the text by hand.
 */
export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="secondary" size="sm" onClick={copy} aria-live="polite">
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
