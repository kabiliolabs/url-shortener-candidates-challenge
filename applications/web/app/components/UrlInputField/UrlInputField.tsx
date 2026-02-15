import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import LinkIcon from "@mui/icons-material/Link";

export interface UrlInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export function UrlInputField({
  value,
  onChange,
  error = false,
  helperText,
  disabled = false,
}: UrlInputFieldProps): React.JSX.Element {
  return (
    <TextField
      fullWidth
      label="URL"
      placeholder="https://example.com/very/long/url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      error={error}
      helperText={helperText}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LinkIcon className="text-text-secondary" />
          </InputAdornment>
        ),
      }}
      className="mb-4"
    />
  );
}
