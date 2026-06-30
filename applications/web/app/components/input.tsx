import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, id, className, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={hasError || undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn(
          "h-11 w-full rounded-xl border bg-white px-3.5 text-base text-slate-900 transition-colors placeholder:text-slate-400",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          hasError
            ? "border-red-400 focus-visible:border-red-500 focus-visible:ring-red-500"
            : "border-slate-300 focus-visible:border-brand-500 focus-visible:ring-brand-500",
          className,
        )}
        {...props}
      />
      {message && (
        <p
          id={messageId}
          className={cn("text-sm", hasError ? "text-red-600" : "text-slate-500")}
        >
          {message}
        </p>
      )}
    </div>
  );
});
