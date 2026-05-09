import { useState, useCallback, useRef, useEffect } from "react";
import { copyToClipboard } from "~/services/clipboard.service";
import { Button } from "./Button";

interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  className?: string;
}

export function CopyButton({
  text,
  label = "Copy",
  successLabel = "Copied!",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setCopied(true);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <Button
      variant={copied ? "secondary" : "ghost"}
      size="sm"
      onClick={handleCopy}
      className={className}
      aria-label={copied ? successLabel : `${label} ${text}`}
    >
      {copied ? successLabel : label}
    </Button>
  );
}
