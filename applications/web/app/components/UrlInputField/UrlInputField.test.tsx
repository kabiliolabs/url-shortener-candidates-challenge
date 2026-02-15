import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UrlInputField } from "./UrlInputField";

describe("UrlInputField", () => {
  it("renders with label and placeholder", () => {
    render(<UrlInputField value="" onChange={() => {}} />);
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://example.com/very/long/url")).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<UrlInputField value="" onChange={onChange} />);
    await user.type(screen.getByLabelText("URL"), "https://test.com");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows helper text when provided", () => {
    render(<UrlInputField value="" onChange={() => {}} helperText="Invalid URL" />);
    expect(screen.getByText("Invalid URL")).toBeInTheDocument();
  });

  it("disables input when disabled", () => {
    render(<UrlInputField value="" onChange={() => {}} disabled />);
    expect(screen.getByLabelText("URL")).toBeDisabled();
  });
});
