import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "./CopyButton";

afterEach(cleanup);

vi.mock("~/services/clipboard.service", () => ({
  copyToClipboard: vi.fn(() => Promise.resolve(true)),
}));

describe("CopyButton", () => {
  it("renders with default label", () => {
    render(<CopyButton text="https://example.com" />);
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("shows success feedback after clicking", async () => {
    render(<CopyButton text="https://example.com" />);
    await userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("renders with custom labels", () => {
    render(<CopyButton text="test" label="Copy URL" successLabel="Done!" />);
    expect(screen.getByRole("button", { name: /copy url/i })).toBeInTheDocument();
  });
});
