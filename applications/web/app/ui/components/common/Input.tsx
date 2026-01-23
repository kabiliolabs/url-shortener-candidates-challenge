import { TextField } from "@radix-ui/themes";
import type { InputProps } from "./types";

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
