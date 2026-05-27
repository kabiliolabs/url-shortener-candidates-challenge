import * as Label from "@radix-ui/react-label";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";
import { FieldError } from "../field-error";

interface TextFieldProps extends ComponentPropsWithoutRef<"input"> {
  error?: string;
  hint?: string;
  label: string;
}

export function TextField({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="grid gap-2">
      <Label.Root className="text-sm font-medium text-zinc-900" htmlFor={inputId}>
        {label}
      </Label.Root>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={[
          "h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-base text-zinc-950 shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10",
          error ? "border-red-400 focus:border-red-600 focus:ring-red-600/10" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        id={inputId}
        {...props}
      />
      {hint && (
        <p className="text-sm text-zinc-500" id={hintId}>
          {hint}
        </p>
      )}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}
