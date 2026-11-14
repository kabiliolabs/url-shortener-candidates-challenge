import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("renders children with the existing default presentation", () => {
    render(<Card role="region" aria-label="Shortener">Form content</Card>);

    const card = screen.getByRole("region", { name: "Shortener" });
    expect(card).toHaveClass("shortener-card");
    expect(card).toHaveTextContent("Form content");
  });

  it("supports the result presentation and forwards custom classes and attributes", () => {
    render(<Card variant="result" className="extra" role="region" aria-label="Result" id="result">Shortened link</Card>);

    const card = screen.getByRole("region", { name: "Result" });
    expect(card).toHaveClass("result-card", "extra");
    expect(card).not.toHaveClass("shortener-card");
    expect(card).toHaveAttribute("id", "result");
    expect(card).toHaveTextContent("Shortened link");
  });
});
