import { useClipboard } from "~/hooks/useClipboard";

interface CopyButtonProps {
  textToCopy: string;
  variant?: "primary" | "text";
  label?: string;
}

/**
 * CopyButton - Reusable button for copying text to clipboard
 * 
 * Features:
 * - Automatic success feedback (2s timeout)
 * - Accessible with proper ARIA labels
 * - Two variants: primary (solid button) and text (inline link)
 */
export function CopyButton({
  textToCopy,
  variant = "primary",
  label = "Copy to clipboard",
}: CopyButtonProps) {
  const { copy, copied, error } = useClipboard();

  const handleClick = () => {
    copy(textToCopy);
  };

  // Variant-specific styling
  const variantClasses = {
    primary:
      "px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors duration-200",
    text: "text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium",
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`${variantClasses[variant]} cursor-pointer`}
        aria-label={copied ? "Copied to clipboard" : label}
        aria-live="polite"
        title={label}
      >
        {copied ? (variant === "primary" ? "✓ Copied!" : "Copied!") : "Copy"}
      </button>
      {error && (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      )}
    </>
  );
}
