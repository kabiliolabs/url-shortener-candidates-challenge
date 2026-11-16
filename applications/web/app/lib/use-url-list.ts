import { useEffect, useState } from "react";

import type { UrlListState } from "~/components/url-list";
import { describeError, fetchUrlList } from "~/lib/api-client";

/** Loads the URL list on mount and again whenever `refreshKey` changes, keeping current rows while refetching. */
export function useUrlList(refreshKey?: string): UrlListState {
  const [state, setState] = useState<UrlListState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetchUrlList(controller.signal).then((result) => {
      if (controller.signal.aborted) {
        return;
      }
      setState(
        result.ok
          ? { status: "ready", urls: result.data.urls }
          : { status: "error", message: describeError(result.error) },
      );
    });

    return () => controller.abort();
  }, [refreshKey]);

  return state;
}
