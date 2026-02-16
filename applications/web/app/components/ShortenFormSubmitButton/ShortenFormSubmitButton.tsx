import { useAtom } from "jotai";
import { LoadingButton } from "../LoadingButton";
import { shortenFormLoadingAtom } from "../../state/index.js";

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
