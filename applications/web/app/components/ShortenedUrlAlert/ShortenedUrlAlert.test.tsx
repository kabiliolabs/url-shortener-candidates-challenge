import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShortenedUrlAlert } from "./ShortenedUrlAlert";

describe("ShortenedUrlAlert", () => {
  it("renders label and CopyableLink with shortened URL", () => {
    render(<ShortenedUrlAlert url="https://app.com/s/abc123" />);
    expect(screen.getByText("Your shortened URL")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "https://app.com/s/abc123" });
    expect(link).toHaveAttribute("href", "https://app.com/s/abc123");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("has copy button that triggers onCopy", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(<ShortenedUrlAlert url="https://short.url/xyz" onCopy={onCopy} />);
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalledWith("https://short.url/xyz");
  });

  it("shows Copied after copy button is clicked", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn().mockResolvedValue(undefined);
    render(<ShortenedUrlAlert url="https://c.com" onCopy={onCopy} />);
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });
});
