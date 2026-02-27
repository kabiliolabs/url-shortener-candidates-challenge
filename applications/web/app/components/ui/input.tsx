import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error = false, type = "text", ...props }, ref) => {
    const baseStyles = "w-full px-4 py-3 text-base bg-white text-slate-800 placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition";

    const errorStyles = error
      ? "border border-red-400 focus:ring-red-500"
      : "border border-slate-300 focus:ring-indigo-500";

    return (
      <input
        type={type}
        className={`${baseStyles} ${errorStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
