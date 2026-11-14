import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TextInput } from "./text-input";

describe("TextInput", () => {
  it("forwards native validation attributes, classes and change callbacks", async () => {
    const user = userEvent.setup();
    const values: string[] = [];
    render(
      <TextInput
        aria-label="Destination"
        name="url"
        type="text"
        required
        className="extra"
        placeholder="Paste a URL"
        onChange={(event) => values.push(event.currentTarget.value)}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Destination" });
    expect(input).toHaveClass("url-input", "extra");
    expect(input).toHaveAttribute("name", "url");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Paste a URL");
    expect(input).toBeRequired();
    expect(input).toBeInvalid();
    await user.type(input, "https://example.com");
    expect(input).toHaveValue("https://example.com");
    expect(input).toBeValid();
    expect(values.at(-1)).toBe("https://example.com");
  });

  it("preserves disabled input behavior and its default class", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextInput aria-label="Destination" disabled defaultValue="existing" onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: "Destination" });
    expect(input).toBeDisabled();
    expect(input).toHaveClass("url-input");
    await user.type(input, "changed");
    expect(input).toHaveValue("existing");
    expect(onChange).not.toHaveBeenCalled();
  });
});
