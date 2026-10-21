import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/cn";

/** Text input with a visual invalid state driven by `aria-invalid` (a11y first). */
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-zinc-900 shadow-sm transition-colors",
        "placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-0",
        "dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100",
        "border-zinc-200 dark:border-zinc-800",
        "aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500",
        className,
      )}
      {...props}
    />
  );
}
