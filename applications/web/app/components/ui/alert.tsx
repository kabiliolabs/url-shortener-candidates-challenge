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
      error: "border-danger-border bg-danger-muted text-danger",
      info: "border-border bg-muted text-muted-foreground",
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
