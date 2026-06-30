import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

/**
 * Form-level error message (rate limiting, unexpected failures) — distinct from
 * inline field validation, which lives on the `Input` itself. Uses `role`
 * "alert" so assistive tech announces it when it appears.
 */
export function Alert({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
        className,
      )}
      {...props}
    />
  );
}
