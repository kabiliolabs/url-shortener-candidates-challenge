import { render, screen } from "@testing-library/react";
import { ContentCard } from "./ContentCard";

describe("ContentCard", () => {
  it("renders children", () => {
    render(<ContentCard>Hello inside card</ContentCard>);
    expect(screen.getByText("Hello inside card")).toBeInTheDocument();
  });

  it("has card styling classes", () => {
    const { container } = render(<ContentCard><span>X</span></ContentCard>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("rounded-xl", "border", "bg-[var(--color-background-paper)]");
  });
});
