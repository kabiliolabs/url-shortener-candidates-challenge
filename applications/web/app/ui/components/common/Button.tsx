import { Button as RadixButton } from "@radix-ui/themes";
import type { ButtonProps } from "./types";

export function Button({
  children,
  variant = "solid",
  size = "3",
  fullWidth = false,
  disabled = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <RadixButton
      variant={variant}
      size={size}
      disabled={disabled}
      className={`${fullWidth ? "w-full" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      {...props}
    >
      {children}
    </RadixButton>
  );
}
