import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CopyButton } from "~/components/copy-button/CopyButton";

describe("URL Shortener - Success/Error Display", () => {
  it("should display error message with proper ARIA attributes", () => {
    render(
      <div
        className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md"
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm text-red-800 font-medium">
          ✗ Invalid URL format. Please enter a valid URL.
        </p>
      </div>,
    );

    const errorContainer = screen.getByRole("alert");
    expect(errorContainer).toHaveTextContent("✗ Invalid URL format");
    expect(errorContainer).toHaveAttribute("aria-live", "assertive");
    expect(errorContainer).toHaveAttribute("role", "alert");
  });

  it("should display success message with proper ARIA attributes", () => {
    render(
      <div
        className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md"
        role="alert"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-green-800 mb-2">
          ✓ Success! Your shortened URL:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value="https://short.url/s/abc123"
            className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm font-mono text-gray-800"
            aria-label="Shortened URL"
          />
          <CopyButton
            textToCopy="https://short.url/s/abc123"
            variant="primary"
          />
        </div>
      </div>,
    );

    const successContainer = screen.getByRole("alert");
    expect(successContainer).toHaveTextContent("✓ Success!");
    expect(successContainer).toHaveAttribute("aria-live", "polite");
    expect(successContainer).toHaveAttribute("role", "alert");
    expect(
      screen.getByDisplayValue("https://short.url/s/abc123"),
    ).toBeInTheDocument();
  });
});

describe("Form Loading State Attributes", () => {
  it("should have correct aria-busy and disabled attributes", () => {
    const isSubmitting = true;

    render(
      <form aria-busy={isSubmitting}>
        <input
          type="url"
          disabled={isSubmitting}
          className="w-full"
          placeholder="Enter URL"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? "Shortening URL..." : "Shorten URL"}
        >
          {isSubmitting ? "Shortening..." : "Shorten URL"}
        </button>
      </form>,
    );

    const input = screen.getByPlaceholderText("Enter URL");
    const button = screen.getByRole("button");
    const form = input.closest("form");

    expect(form).toHaveAttribute("aria-busy", "true");
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Shortening...");
    expect(button).toHaveAttribute("aria-label", "Shortening URL...");
  });

  it("should not be disabled when not submitting", () => {
    const isSubmitting = false;

    render(
      <form aria-busy={isSubmitting}>
        <input type="url" disabled={isSubmitting} placeholder="Enter URL" />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? "Shortening URL..." : "Shorten URL"}
        >
          {isSubmitting ? "Shortening..." : "Shorten URL"}
        </button>
      </form>,
    );

    const input = screen.getByPlaceholderText("Enter URL");
    const button = screen.getByRole("button");
    const form = input.closest("form");

    expect(form).toHaveAttribute("aria-busy", "false");
    expect(input).not.toBeDisabled();
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("Shorten URL");
    expect(button).toHaveAttribute("aria-label", "Shorten URL");
  });
});
