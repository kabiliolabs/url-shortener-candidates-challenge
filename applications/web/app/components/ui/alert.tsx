import type { ReactNode } from "react";
import { cn } from "~/lib/cn";

/**
 * Error / info message. `role="alert"` + `aria-live` so screen readers announce
 * server validation failures, which the original markup did not do at all.
 */
export function Alert({
  tone = "error",
  children,
  className,
}: {
  tone?: "error" | "info";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "rounded-lg border px-3.5 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
        className,
      )}
    >
      {children}
    </div>
  );
}
