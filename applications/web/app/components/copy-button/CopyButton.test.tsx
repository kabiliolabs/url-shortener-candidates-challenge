import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show success feedback and call clipboard API", async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });

    render(
      <CopyButton textToCopy="https://short.url/abc123" variant="primary" />,
    );

    // Initial state
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy");
    expect(button).toHaveAttribute("aria-label", "Copy to clipboard");

    // Click button
    await userEvent.click(button);

    // Verify clipboard API called
    expect(mockClipboard).toHaveBeenCalledWith("https://short.url/abc123");

    // Verify success state
    expect(button).toHaveTextContent("✓ Copied!");
    expect(button).toHaveAttribute("aria-label", "Copied to clipboard");

    // Verify auto-reset after 2s
    await waitFor(
      () => {
        expect(button).toHaveTextContent("Copy");
        expect(button).toHaveAttribute("aria-label", "Copy to clipboard");
      },
      { timeout: 2500 },
    );
  });

  it("should display error message when clipboard fails", async () => {
    const mockClipboard = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard permission denied"));
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });

    render(<CopyButton textToCopy="https://short.url/abc123" variant="text" />);

    const button = screen.getByRole("button");

    // Click button
    await userEvent.click(button);

    // Verify error message appears
    const errorMessage = await screen.findByRole("alert");
    expect(errorMessage).toHaveTextContent("Failed to copy to clipboard");

    // Button should still show Copy (not Copied)
    expect(button).toHaveTextContent("Copy");
  });

  it("should render text variant correctly", () => {
    render(<CopyButton textToCopy="https://short.url/xyz789" variant="text" />);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy");
    expect(button).toHaveClass("text-xs", "text-indigo-600");
  });

  it("should render primary variant correctly", () => {
    render(
      <CopyButton textToCopy="https://short.url/xyz789" variant="primary" />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Copy");
    expect(button).toHaveClass("bg-green-600", "text-white");
  });

  it("should use custom label when provided", () => {
    render(
      <CopyButton
        textToCopy="https://short.url/abc123"
        variant="primary"
        label="Copy shortened link"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Copy shortened link");
    expect(button).toHaveAttribute("title", "Copy shortened link");
  });
});
