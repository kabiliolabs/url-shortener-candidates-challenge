import { useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "../api/types.js";
import { shortenUrl } from "../api/client.js";
import { urlKeys } from "../api/query-keys.js";
import {
  getShortenErrorMessage,
  getEmptyResultMessage,
} from "../api/error-messages.js";
import { normalizeUrl } from "../utils/url.js";
import {
  shortenFormUrlAtom,
  shortenFormLoadingAtom,
  shortenFormErrorAtom,
  shortenFormCopyErrorAtom,
  lastShortenedUrlAtom,
} from "../state/index.js";
import type { UseShortenUrlReturn } from "./types.js";

/**
 * Hook for the shorten-URL form: submit mutation and derived state.
 * Form state (url, loading, error, result) lives in Jotai atoms; components use useAtom to read/write.
 */
export function useShortenUrl(): UseShortenUrlReturn {
  const [url, setUrl] = useAtom(shortenFormUrlAtom);
  const setLoading = useSetAtom(shortenFormLoadingAtom);
  const setError = useSetAtom(shortenFormErrorAtom);
  const setCopyError = useSetAtom(shortenFormCopyErrorAtom);
  const setLastShortened = useSetAtom(lastShortenedUrlAtom);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (rawUrl: string) => {
      const trimmed = rawUrl.trim();
      if (!trimmed) return Promise.reject(new Error("URL is required"));
      return shortenUrl(normalizeUrl(trimmed));
    },
    onMutate: () => {
      setError(null);
      setLastShortened(null);
      setLoading(true);
    },
    onSuccess: (data) => {
      const resultUrl =
        data.shortenedUrl && typeof data.shortenedUrl === "string"
          ? data.shortenedUrl.trim()
          : null;
      if (resultUrl) {
        setLastShortened(resultUrl);
        setError(null);
        queryClient.invalidateQueries({ queryKey: urlKeys.list() });
      } else {
        setError(getEmptyResultMessage());
      }
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Failed to shorten URL";
      const status =
        e instanceof Error && "status" in e ? (e as ApiError).status : undefined;
      setError(getShortenErrorMessage(msg, status));
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const submit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      mutation.mutate(url.trim());
    },
    [url, mutation]
  );

  const errorMessage = (() => {
    if (mutation.error) {
      const msg =
        mutation.error instanceof Error
          ? mutation.error.message
          : "Failed to shorten URL";
      const status =
        mutation.error instanceof Error && "status" in mutation.error
          ? (mutation.error as ApiError).status
          : undefined;
      return getShortenErrorMessage(msg, status);
    }
    if (mutation.isSuccess && mutation.data) {
      const hasUrl =
        "shortenedUrl" in mutation.data &&
        mutation.data.shortenedUrl &&
        String(mutation.data.shortenedUrl).trim();
      if (!hasUrl) return getEmptyResultMessage();
    }
    return null;
  })();

  const shortenedUrl =
    mutation.isSuccess &&
    mutation.data &&
    "shortenedUrl" in mutation.data &&
    typeof (mutation.data as { shortenedUrl?: string }).shortenedUrl === "string"
      ? (mutation.data as { shortenedUrl: string }).shortenedUrl.trim()
      : null;

  const showError = !!errorMessage && !shortenedUrl;

  const result: UseShortenUrlReturn = {
    url,
    setUrl,
    submit,
    loading: mutation.isPending,
    error: showError ? errorMessage : null,
    shortenedUrl: shortenedUrl ?? null,
    reset: () => {
      setUrl("");
      setError(null);
      setCopyError(null);
      mutation.reset();
    },
  };
  return result;
}
