import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsCard } from "./StatsCard";

describe("StatsCard", () => {
  it("should render title and value", () => {
    render(<StatsCard title="Total URLs" value={42} />);

    expect(screen.getByText("Total URLs")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("should render string values", () => {
    render(<StatsCard title="Status" value="Active" />);

    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("should render optional subtitle when provided", () => {
    render(
      <StatsCard title="Total Clicks" value={1234} subtitle="Last 30 days" />,
    );

    expect(screen.getByText("Total Clicks")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("Last 30 days")).toBeInTheDocument();
  });

  it("should not render subtitle when not provided", () => {
    render(<StatsCard title="Total URLs" value={10} />);

    // Subtitle text should not exist
    const card = screen.getByText("Total URLs").closest("div");
    expect(card?.querySelector(".text-xs")).not.toBeInTheDocument();
  });

  it("should render zero values correctly", () => {
    render(<StatsCard title="Failed Requests" value={0} />);

    expect(screen.getByText("Failed Requests")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    render(<StatsCard title="Test" value={100} />);

    // Get the parent container (not the text div)
    const textElement = screen.getByText("Test");
    const container = textElement.parentElement;
    expect(container).toHaveClass("bg-white", "rounded-lg", "shadow", "p-6");
  });
});
