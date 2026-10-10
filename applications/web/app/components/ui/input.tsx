import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 transition-colors placeholder:text-slate-500 focus-visible:border-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-600 aria-invalid:border-red-600 aria-invalid:focus-visible:outline-red-600 disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
