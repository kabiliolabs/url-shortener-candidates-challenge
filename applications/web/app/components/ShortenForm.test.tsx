import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ShortenForm } from "./ShortenForm";

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter([{ path: "/", element: ui }]);
  return render(<RouterProvider router={router} />);
}

describe("ShortenForm", () => {
  it("renders form with URL input and submit button", async () => {
    const { container } = renderWithRouter(<ShortenForm />);
    await waitFor(() => {
      expect(container.querySelector('input[name="url"]')).toBeInTheDocument();
      expect(container.querySelector('button[type="submit"]')).toBeInTheDocument();
    });
  });

  it("input has placeholder 'https://example.com'", async () => {
    const { container } = renderWithRouter(<ShortenForm />);
    await waitFor(() => {
      const input = container.querySelector('input[name="url"]');
      expect(input).toHaveAttribute("placeholder", "https://example.com");
    });
  });

  it("submit button says 'Shorten'", async () => {
    const { container } = renderWithRouter(<ShortenForm />);
    await waitFor(() => {
      const button = container.querySelector('button[type="submit"]');
      expect(button).toHaveTextContent("Shorten");
    });
  });

  it("input is required", async () => {
    const { container } = renderWithRouter(<ShortenForm />);
    await waitFor(() => {
      const input = container.querySelector('input[name="url"]');
      expect(input).toBeRequired();
    });
  });

  it("renders hidden recaptcha token field", async () => {
    const { container } = renderWithRouter(<ShortenForm />);
    await waitFor(() => {
      const hidden = container.querySelector('input[name="recaptcha_token"]');
      expect(hidden).toBeInTheDocument();
      expect(hidden).toHaveAttribute("type", "hidden");
    });
  });
});
