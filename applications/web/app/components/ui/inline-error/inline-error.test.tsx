import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InlineError } from "./inline-error";

describe("InlineError", () => {
  it("renders the message as text with the default presentation", () => {
    const { container } = render(<InlineError message="<script>not executable</script>" />);

    expect(screen.getByText("<script>not executable</script>")).toBeVisible();
    expect(container.firstElementChild).toHaveClass("form-error");
    expect(container.querySelector("script")).not.toBeInTheDocument();
  });

  it("accepts React content and forwards classes and native attributes", () => {
    render(<InlineError message={<strong>Try again</strong>} className="extra" role="note" aria-label="Feedback" id="feedback" />);

    const feedback = screen.getByRole("note", { name: "Feedback" });
    expect(feedback).toHaveClass("form-error", "extra");
    expect(feedback).toHaveAttribute("id", "feedback");
    expect(feedback).toHaveTextContent("Try again");
  });
});
