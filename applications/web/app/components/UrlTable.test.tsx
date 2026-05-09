import { describe, it, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { UrlTable } from "./UrlTable";

const baseUrl = "http://localhost:3000/s/";

const mockUrls = [
  {
    id: 1,
    shortCode: "abc123",
    originalUrl:
      "https://example.com/very-long-url-that-should-be-truncated-to-show-less-text",
    clickCount: 42,
    createdAt: new Date("2025-01-15"),
    sparklineData: [1, 3, 5, 2, 4],
  },
  {
    id: 2,
    shortCode: "def456",
    originalUrl: "https://short.com",
    clickCount: 0,
    createdAt: new Date("2025-01-16"),
    sparklineData: [],
  },
];

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter([{ path: "/", element: ui }]);
  return render(<RouterProvider router={router} />);
}

describe("UrlTable", () => {
  it("renders empty state message when urls array is empty", async () => {
    const { container } = renderWithRouter(<UrlTable urls={[]} baseUrl={baseUrl} />);
    await waitFor(() => {
      expect(container.textContent).toContain("No URLs shortened yet");
    });
  });

  it("renders table with correct number of rows", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      const rows = container.querySelectorAll("tr");
      // 1 header row + 2 data rows
      expect(rows).toHaveLength(3);
    });
  });

  it("displays short codes with links", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      expect(container.textContent).toContain("/abc123");
      expect(container.textContent).toContain("/def456");
    });
  });

  it("truncates long URLs", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      // The long URL should be truncated (> 50 chars), not shown in full
      expect(container.textContent).not.toContain(mockUrls[0].originalUrl);
      // Short URL should be displayed as-is
      expect(container.textContent).toContain("https://short.com");
    });
  });

  it("shows click count in badge", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      expect(container.textContent).toContain("42");
      expect(container.textContent).toContain("0");
    });
  });

  it("renders sparkline SVGs", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      const sparklines = container.querySelectorAll('svg[aria-label="Trend"]');
      expect(sparklines).toHaveLength(2);
    });
  });

  it("shows 'View Stats' links pointing to /stats/{code}", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    await waitFor(() => {
      const statsLinks = container.querySelectorAll('a[href*="/stats/"]');
      expect(statsLinks).toHaveLength(2);
      expect(statsLinks[0]).toHaveAttribute("href", "/stats/abc123");
      expect(statsLinks[1]).toHaveAttribute("href", "/stats/def456");
    });
  });

  it("displays formatted dates", async () => {
    const { container } = renderWithRouter(
      <UrlTable urls={mockUrls} baseUrl={baseUrl} />,
    );
    const formattedDate1 = new Date("2025-01-15").toLocaleDateString();
    const formattedDate2 = new Date("2025-01-16").toLocaleDateString();
    await waitFor(() => {
      expect(container.textContent).toContain(formattedDate1);
      expect(container.textContent).toContain(formattedDate2);
    });
  });
});
