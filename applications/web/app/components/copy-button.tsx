import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";

type Status = "idle" | "copied" | "failed";

const LABELS: Record<Status, string> = { idle: "Copy", copied: "Copied!", failed: "Copy failed" };

/** Copies `value` to the clipboard and shows feedback for a couple of seconds (SPEC-008). */
export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      // Clipboard API needs a secure context (https or localhost) and user permission.
      setStatus("failed");
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} className={className}>
      {status === "copied" ? <Check aria-hidden /> : <Copy aria-hidden />}
      <span aria-live="polite">{LABELS[status]}</span>
    </Button>
  );
}
