import { useEffect, useRef } from "react";
import { useRevalidator } from "react-router";

/**
 * Re-runs the route's loaders when the tab regains focus.
 *
 * Click counts are server state: they change when someone opens `/s/:code`,
 * usually in another tab or from another browser entirely. Local component
 * state could not know about that, so the fix is to re-ask the server at the
 * moment the user can actually see the answer — coming back to the tab after
 * following a short link.
 *
 * Cheap (one loader round trip per focus, and only when idle) and it also picks
 * up visits made by other people, which an optimistic local increment would miss.
 */
export function useRevalidateOnFocus(): void {
  const revalidator = useRevalidator();

  // Held in a ref so the listeners are registered once, not on every render.
  const revalidatorRef = useRef(revalidator);
  revalidatorRef.current = revalidator;

  useEffect(() => {
    function revalidateIfVisible() {
      const current = revalidatorRef.current;
      if (document.visibilityState === "visible" && current.state === "idle") {
        current.revalidate();
      }
    }

    window.addEventListener("focus", revalidateIfVisible);
    document.addEventListener("visibilitychange", revalidateIfVisible);

    return () => {
      window.removeEventListener("focus", revalidateIfVisible);
      document.removeEventListener("visibilitychange", revalidateIfVisible);
    };
  }, []);
}
