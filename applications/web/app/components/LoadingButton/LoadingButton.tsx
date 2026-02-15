import Button from "@mui/material/Button";

export interface LoadingButtonProps {
  type?: "button" | "submit" | "reset";
  loading: boolean;
  label: string;
  loadingLabel?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function LoadingButton({
  type = "submit",
  loading,
  label,
  loadingLabel = "Loading…",
  disabled = false,
  fullWidth = true,
}: LoadingButtonProps): React.JSX.Element {
  return (
    <Button
      type={type}
      variant="contained"
      fullWidth={fullWidth}
      disabled={disabled || loading}
      size="large"
      className="py-3"
    >
      {loading ? loadingLabel : label}
    </Button>
  );
}
