import { useState, useCallback } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);

      // Auto-reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
      console.error("Copy failed:", err);
    }
  }, []);

  return { copy, copied, error };
}
