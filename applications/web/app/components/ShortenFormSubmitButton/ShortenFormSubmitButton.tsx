import { useAtom } from "jotai";
import { LoadingButton } from "../LoadingButton";
import { shortenFormLoadingAtom } from "../../state/index.js";

/**
 * Submit button for the shorten form. Reads loading state from Jotai;
 * no loading passed as prop.
 */
export function ShortenFormSubmitButton(): React.JSX.Element {
  const [loading] = useAtom(shortenFormLoadingAtom);

  return (
    <LoadingButton
      loading={loading}
      label="Shorten"
      loadingLabel="Shortening…"
    />
  );
}
