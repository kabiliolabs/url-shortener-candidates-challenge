import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
  leadingVisual?: ReactNode;
}

export function FormField({
  className,
  label,
  hint,
  error,
  leadingVisual,
  id,
  ...props
}: FormFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="block text-sm font-semibold text-neutral-900">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 transition-shadow",
          error
            ? "border-black/30 shadow-[0_0_0_4px_rgba(0,0,0,0.05)]"
            : "border-black/10 focus-within:border-black/30 focus-within:shadow-[0_0_0_4px_rgba(0,0,0,0.05)]",
        )}
      >
        {leadingVisual && <span className="text-neutral-400">{leadingVisual}</span>}
        <input
          id={fieldId}
          className={cn(
            "w-full border-0 bg-transparent text-base text-black outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:text-neutral-400",
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="text-sm font-medium text-neutral-700">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="text-sm text-neutral-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}