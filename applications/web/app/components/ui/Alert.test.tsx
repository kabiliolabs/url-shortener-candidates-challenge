import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Alert } from "./Alert";

afterEach(cleanup);

describe("Alert", () => {
  it("renders with role alert", () => {
    render(<Alert>Test message</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  it("applies error variant class", () => {
    render(<Alert variant="error">Error!</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-error");
  });

  it("applies success variant class", () => {
    render(<Alert variant="success">Done!</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("alert-success");
  });
});
