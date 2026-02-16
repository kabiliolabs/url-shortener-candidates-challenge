import { useCallback } from "react";
import { useAtom, useSetAtom } from "jotai";
import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "../api/types.js";
import { shortenUrl } from "../api/client.js";
import {
  getShortenErrorMessage,
  getEmptyResultMessage,
} from "../api/error-messages.js";
import { normalizeUrl, validateUrl } from "../utils/url.js";
import {
  shortenFormUrlAtom,
  shortenFormLoadingAtom,
  shortenFormErrorAtom,
  shortenFormCopyErrorAtom,
  lastShortenedUrlAtom,
  urlListAtom,
  loadUrlList,
} from "../state/index.js";
import type { UseShortenUrlReturn } from "./types.js";

/**
 * Hook for the shorten-URL form: submit mutation and derived state.
 */
export function useShortenUrl(): UseShortenUrlReturn {
  const [url, setUrl] = useAtom(shortenFormUrlAtom);
  const setLoading = useSetAtom(shortenFormLoadingAtom);
  const setError = useSetAtom(shortenFormErrorAtom);
  const setCopyError = useSetAtom(shortenFormCopyErrorAtom);
  const setLastShortened = useSetAtom(lastShortenedUrlAtom);
  const setUrlList = useSetAtom(urlListAtom);

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
        void loadUrlList(setUrlList);
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
      const trimmed = url.trim();
      const validation = validateUrl(trimmed);
      if (!validation.valid) {
        setError(validation.message);
        setLastShortened(null);
        return;
      }
      // Defer to next task so first click isn't lost to focus/activation after load
      setTimeout(() => {
        mutation.mutate(validation.url);
      }, 0);
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
