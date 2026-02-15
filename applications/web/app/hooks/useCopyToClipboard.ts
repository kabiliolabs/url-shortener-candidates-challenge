import { useState, useCallback } from "react";
import type { UseCopyToClipboardReturn } from "./types.js";

const COPIED_RESET_MS = 2000;

/**
 * Hook to copy text to clipboard and track "copied" and optional error state.
 */
export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copy = useCallback<UseCopyToClipboardReturn["copy"]>(async (text: string) => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      setCopyError("Copy failed");
      return Promise.reject(new Error("Copy failed"));
    }
  }, []);

  const clearCopyError = useCallback(() => setCopyError(null), []);

  const result: UseCopyToClipboardReturn = {
    copy,
    copied,
    copyError,
    clearCopyError,
  };
  return result;
}
