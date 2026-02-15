import { render, screen } from "@testing-library/react";
import { PageSection } from "./PageSection";

describe("PageSection", () => {
  it("renders children", () => {
    render(<PageSection>Page content</PageSection>);
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("applies default maxWidth 560", () => {
    const { container } = render(<PageSection><span>X</span></PageSection>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ maxWidth: "560px" });
  });

  it("applies custom maxWidth", () => {
    const { container } = render(<PageSection maxWidth={800}><span>X</span></PageSection>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveStyle({ maxWidth: "800px" });
  });
});
