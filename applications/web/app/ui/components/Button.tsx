import { Button as RadixButton } from "@radix-ui/themes";
import type { ComponentProps, ReactNode } from "react";

interface ButtonProps extends Omit<ComponentProps<typeof RadixButton>, "children"> {
  children: ReactNode;
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "1" | "2" | "3" | "4";
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = "solid",
  size = "3",
  fullWidth = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <RadixButton
      variant={variant}
      size={size}
      className={`${fullWidth ? "w-full" : ""} cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </RadixButton>
  );
}
