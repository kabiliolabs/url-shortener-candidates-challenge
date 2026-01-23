import type { Button as RadixButton, TextField } from "@radix-ui/themes";
import type { ComponentProps, CSSProperties, ReactNode } from "react";

// Button Types
export interface ButtonProps extends Omit<ComponentProps<typeof RadixButton>, "children"> {
  children: ReactNode;
  variant?: "solid" | "soft" | "outline" | "ghost";
  size?: "1" | "2" | "3" | "4";
  fullWidth?: boolean;
  disabled?: boolean;
}

// Card Types
export interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  variant?: "surface" | "classic" | "ghost";
}

// Input Types
export type InputType = "text" | "url" | "email" | "password" | "search" | "tel" | "number" | "hidden";

export interface InputProps extends ComponentProps<typeof TextField.Root> {
  placeholder?: string;
  name?: string;
  required?: boolean;
  type?: InputType;
}
