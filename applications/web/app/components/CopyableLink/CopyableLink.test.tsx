import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyableLink } from "./CopyableLink";

describe("CopyableLink", () => {
  it("renders link with display text", () => {
    render(<CopyableLink href="https://short.url/abc" />);
    expect(screen.getByRole("link", { name: "https://short.url/abc" })).toHaveAttribute("href", "https://short.url/abc");
  });

  it("renders custom display text", () => {
    render(<CopyableLink href="https://x.com" displayText="Open X" />);
    expect(screen.getByRole("link", { name: "Open X" })).toBeInTheDocument();
  });

  it("calls onCopy when copy button is clicked", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(<CopyableLink href="https://c.com" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalledWith("https://c.com");
  });

  it("shows Copied after copy", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(<CopyableLink href="https://c.com" onCopy={onCopy} />);
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
