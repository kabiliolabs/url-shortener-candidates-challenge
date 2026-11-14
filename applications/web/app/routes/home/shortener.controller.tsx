import { useActionData, useLoaderData } from "react-router";
import type { action, loader } from "./route";
import { ShortenerView } from "./shortener.view";

export function ShortenerController() {
  const { baseUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <ShortenerView
      baseUrl={baseUrl}
      shortenedUrl={actionData?.shortenedUrl}
      error={actionData?.error}
    />
  );
}
