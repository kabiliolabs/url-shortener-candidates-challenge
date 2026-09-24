import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // The clipboard API can be unavailable (e.g. insecure context); the link stays selectable.
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={copy} aria-label="Copy short link">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}