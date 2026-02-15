import { useQuery } from "@tanstack/react-query";
import { listUrls } from "../api/client.js";
import { urlKeys } from "../api/query-keys.js";
import { getListUrlsErrorMessage } from "../api/error-messages.js";
import type { UseUrlListReturn } from "./types.js";

/**
 * Fetches the list of shortened URLs with TanStack Query.
 * Maps API errors to user-facing messages.
 */
export function useUrlList(): UseUrlListReturn {
  const query = useQuery({
    queryKey: urlKeys.list(),
    queryFn: async () => {
      const res = await listUrls();
      return res.urls;
    },
  });

  const errorMessage =
    query.error && query.isError
      ? getListUrlsErrorMessage(
          query.error instanceof Error ? query.error.message : "Failed to load URLs"
        )
      : null;

  const result: UseUrlListReturn = {
    urls: query.data ?? [],
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: errorMessage,
    refetch: query.refetch,
  };
  return result;
}
