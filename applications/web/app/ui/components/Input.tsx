import { TextField } from "@radix-ui/themes";
import type { ComponentProps } from "react";

interface InputProps extends ComponentProps<typeof TextField.Root> {
  placeholder?: string;
  name?: string;
  required?: boolean;
  type?: string;
}

export function Input({
  placeholder,
  name,
  required,
  type = "text",
  size = "3",
  ...props
}: InputProps) {
  return (
    <TextField.Root
      placeholder={placeholder}
      name={name}
      required={required}
      type={type}
      size={size}
      {...props}
    />
  );
}
