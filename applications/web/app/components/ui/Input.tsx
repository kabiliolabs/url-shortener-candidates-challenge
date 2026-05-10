import type { InputHTMLAttributes, Ref } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ref,
  ...rest
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`input input-bordered w-full ${error ? "input-error" : ""} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-error text-sm mt-1">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-base-content/60 text-sm mt-1">{helperText}</p>
      )}
    </div>
  );
}
