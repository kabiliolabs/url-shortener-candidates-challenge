interface FieldErrorProps {
  children?: string;
  id?: string;
}

export function FieldError({ children, id }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p className="text-sm font-medium text-red-700" id={id} role="alert">
      {children}
    </p>
  );
}
