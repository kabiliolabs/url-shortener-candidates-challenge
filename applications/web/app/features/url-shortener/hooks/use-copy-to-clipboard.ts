import { useCallback, useState } from "react";

export function useCopyToClipboard(timeoutMs = 1_500) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (value: string) => {
      if (!navigator.clipboard) {
        return false;
      }

      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), timeoutMs);
      return true;
    },
    [timeoutMs],
  );

  return { copied, copy };
}
