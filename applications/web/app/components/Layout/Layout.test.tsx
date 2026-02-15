import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Layout } from "./Layout";

function Wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe("Layout", () => {
  it("renders app title link", () => {
    render(<Layout><span>Child</span></Layout>, { wrapper: Wrapper });
    expect(screen.getByRole("link", { name: "URL Shortener" })).toHaveAttribute("href", "/");
  });

  it("renders Shorten and All URLs tabs", () => {
    render(<Layout><span>Child</span></Layout>, { wrapper: Wrapper });
    expect(screen.getByRole("tab", { name: "Shorten" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All URLs" })).toBeInTheDocument();
  });

  it("renders children in main", () => {
    render(<Layout><span>Page content</span></Layout>, { wrapper: Wrapper });
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
