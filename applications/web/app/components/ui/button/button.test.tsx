import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders content and forwards classes, attributes and click handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button type="button" className="extra" title="Shorten a URL" onClick={onClick}>Shorten</Button>);

    const button = screen.getByRole("button", { name: "Shorten" });
    expect(button).toHaveClass("submit-button", "extra");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("title", "Shorten a URL");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("preserves disabled behavior and its default class", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Shorten</Button>);

    const button = screen.getByRole("button", { name: "Shorten" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("submit-button");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
