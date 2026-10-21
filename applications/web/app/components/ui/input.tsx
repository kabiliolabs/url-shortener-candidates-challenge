import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

/** Text input with a visual invalid state driven by `aria-invalid` (a11y first). */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-border bg-card px-3.5 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
        "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger",
        className,
      )}
      {...props}
    />
  );
}
