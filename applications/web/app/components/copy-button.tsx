import { useState } from "react";
import { Button } from "./button";
import type { ButtonSize } from "./button";

type CopyButtonProps = {
  value: string;
  label?: string;
  size?: ButtonSize;
  className?: string;
};

type CopyStatus = "idle" | "copied" | "error";

const STATUS_LABELS: Record<Exclude<CopyStatus, "idle">, string> = {
  copied: "Copied",
  error: "Copy failed",
};

/**
 * Copies `value` to the clipboard and confirms inline for a couple of seconds.
 * Client-only behaviour (clipboard access), kept in its own component so the
 * routes stay declarative.
 */
export function CopyButton({
  value,
  label = "Copy",
  size,
  className,
}: CopyButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    window.setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <Button
      variant="secondary"
      size={size}
      onClick={handleCopy}
      className={className}
    >
      <span aria-live="polite">
        {status === "idle" ? label : STATUS_LABELS[status]}
      </span>
    </Button>
  );
}
