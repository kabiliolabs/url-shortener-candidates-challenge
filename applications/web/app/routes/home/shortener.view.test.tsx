import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { ShortenerView } from "./shortener.view";

function renderView(props: Partial<ComponentProps<typeof ShortenerView>> = {}) {
  const action = vi.fn(() => null);
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => <ShortenerView baseUrl="https://sho.rt/s/" {...props} />,
      action,
    },
  ]);

  render(<Stub initialEntries={["/"]} />);
  return { action };
}

describe("ShortenerView", () => {
  it("renders the heading, prefix and native form controls", () => {
    renderView();

    expect(
      screen.getByRole("heading", { name: "URL Shortener" }),
    ).toBeVisible();
    expect(
      screen.getByText(/Your shortened URL will start with/),
    ).toHaveTextContent("https://sho.rt/s/");
    const input = screen.getByPlaceholderText("Enter your URL here...");
    expect(input).toHaveAttribute("name", "url");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toBeRequired();
    expect(input.closest("form")).toHaveAttribute("method", "post");
    expect(screen.getByRole("button", { name: "SHORTEN IT" })).toHaveAttribute(
      "type",
      "submit",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByText("Your shortened URL:")).not.toBeInTheDocument();
    expect(screen.queryByText("URL is required")).not.toBeInTheDocument();
  });

  it("lets native required validation block an empty submission", async () => {
    const user = userEvent.setup();
    const { action } = renderView();

    await user.click(screen.getByRole("button", { name: "SHORTEN IT" }));

    expect(screen.getByRole("textbox")).toBeInvalid();
    expect(action).not.toHaveBeenCalled();
    expect(screen.queryByText("URL is required")).not.toBeInTheDocument();
  });

  it("renders a supplied result with the existing new-tab link attributes", () => {
    renderView({ shortenedUrl: "https://sho.rt/s/ab" });

    const link = screen.getByRole("link", { name: "https://sho.rt/s/ab" });
    expect(screen.getByText("Your shortened URL:")).toBeVisible();
    expect(link).toHaveAttribute("href", "https://sho.rt/s/ab");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders supplied error feedback without a result", () => {
    renderView({ error: "URL is required" });

    expect(screen.getByText("URL is required")).toBeVisible();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
