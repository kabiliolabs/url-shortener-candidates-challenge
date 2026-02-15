import { render, screen } from "@testing-library/react";
import { LoadingButton } from "./LoadingButton";

describe("LoadingButton", () => {
  it("renders label when not loading", () => {
    render(<LoadingButton loading={false} label="Submit" />);
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("renders loading label when loading", () => {
    render(<LoadingButton loading label="Submit" loadingLabel="Sending…" />);
    expect(screen.getByRole("button", { name: "Sending…" })).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<LoadingButton loading label="Submit" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<LoadingButton loading={false} label="Submit" disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
