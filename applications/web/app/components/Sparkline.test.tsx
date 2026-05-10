import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./Sparkline";

describe("Sparkline", () => {
  it("renders empty SVG for empty data array", () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = container.querySelector("svg")!;
    expect(svg).toBeInTheDocument();
    expect(svg.children).toHaveLength(0);
  });

  it("renders single dot (circle) for single data point", () => {
    const { container } = render(<Sparkline data={[5]} />);
    const circle = container.querySelector("circle");
    expect(circle).toBeInTheDocument();
  });

  it("renders polyline for multiple data points", () => {
    const { container } = render(<Sparkline data={[1, 3, 5, 2, 4]} />);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    expect(polyline?.getAttribute("points")).toBeTruthy();
  });

  it("handles flat data (all same values) without dividing by zero", () => {
    const { container } = render(<Sparkline data={[3, 3, 3, 3]} />);
    const polyline = container.querySelector("polyline");
    expect(polyline).toBeInTheDocument();
    const points = polyline?.getAttribute("points") ?? "";
    expect(points).not.toContain("NaN");
    expect(points).not.toContain("Infinity");
  });

  it("applies custom width and height", () => {
    const { container } = render(<Sparkline data={[1, 2]} width={120} height={40} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("120");
    expect(svg.getAttribute("height")).toBe("40");
  });

  it("has correct aria-label", () => {
    const { container } = render(<Sparkline data={[1, 2]} label="Click trend" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("Click trend");
  });

  it("uses default aria-label when none provided", () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-label")).toBe("Trend");
  });
});
