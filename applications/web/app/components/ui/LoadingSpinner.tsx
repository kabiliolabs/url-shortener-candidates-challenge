interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <span
      className={`loading loading-spinner ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
