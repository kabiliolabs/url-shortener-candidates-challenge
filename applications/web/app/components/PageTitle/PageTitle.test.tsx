import { render, screen } from "@testing-library/react";
import { PageTitle } from "./PageTitle";

describe("PageTitle", () => {
  it("renders title", () => {
    render(<PageTitle title="My Title" />);
    expect(screen.getByRole("heading", { name: "My Title" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<PageTitle title="T" subtitle="Sub text" />);
    expect(screen.getByText("Sub text")).toBeInTheDocument();
  });

  it("does not render subtitle when not provided", () => {
    render(<PageTitle title="T" />);
    expect(screen.queryByText("Sub text")).not.toBeInTheDocument();
  });
});
