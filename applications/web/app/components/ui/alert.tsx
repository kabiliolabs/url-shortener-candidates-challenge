import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "~/lib/cn";

/**
 * Message block for server-side errors.
 *
 * `role="alert"` + `aria-live` so screen readers announce validation failures,
 * which the original markup did not do at all.
 */
const alertVariants = cva("rounded-lg border px-3.5 py-3 text-sm", {
  variants: {
    tone: {
      error:
        "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
      info: "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300",
    },
  },
  defaultVariants: { tone: "error" },
});

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ tone, className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  );
}
