import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatsCard } from "~/components/stats-card/StatsCard";
import { UrlCard } from "~/components/UrlCard";

describe("Dashboard Stats Calculations", () => {
  it("should calculate total clicks correctly", () => {
    const urls = [{ clickCount: 42 }, { clickCount: 18 }, { clickCount: 30 }];

    const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
    expect(totalClicks).toBe(90);
  });

  it("should calculate average clicks per URL", () => {
    const urls = [{ clickCount: 42 }, { clickCount: 18 }];

    const totalClicks = urls.reduce((sum, url) => sum + url.clickCount, 0);
    const avgClicksPerUrl = Math.round(totalClicks / urls.length);

    expect(avgClicksPerUrl).toBe(30); // Math.round(60/2)
  });

  it("should handle zero URLs for average", () => {
    const urls: Array<{ clickCount: number }> = [];
    const avgClicksPerUrl =
      urls.length > 0
        ? Math.round(
            urls.reduce((sum, url) => sum + url.clickCount, 0) / urls.length,
          )
        : 0;

    expect(avgClicksPerUrl).toBe(0);
  });
});

describe("Dashboard with StatsCards", () => {
  it("should display stats cards with correct values", () => {
    render(
      <>
        <StatsCard title="Total URLs" value={2} />
        <StatsCard title="Total Clicks" value={60} />
        <StatsCard title="Avg. Clicks per URL" value={30} />
      </>,
    );

    expect(screen.getByText("Total URLs")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Total Clicks")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("Avg. Clicks per URL")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

describe("Dashboard with UrlCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render UrlCard with copy functionality", async () => {
    const mockClipboard = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockClipboard },
    });

    render(
      <UrlCard
        shortCode="abc123"
        originalUrl="https://example.com/very-long-url"
        clickCount={42}
        createdAt={new Date("2024-01-01")}
        recentClicks={[]}
        baseUrl="https://short.url"
      />,
    );

    // Verify URL card rendered
    expect(screen.getByText(/abc123/)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText(/clicks/)).toBeInTheDocument();

    // Test integrated copy button
    const copyButton = screen.getByRole("button", {
      name: /copy to clipboard/i,
    });
    expect(copyButton).toBeInTheDocument();

    await userEvent.click(copyButton);

    expect(mockClipboard).toHaveBeenCalledWith("https://short.url/s/abc123");
    expect(copyButton).toHaveTextContent("Copied!");
  });

  it("should display recent clicks when available", () => {
    render(
      <UrlCard
        shortCode="abc123"
        originalUrl="https://example.com/url"
        clickCount={3}
        createdAt={new Date("2024-01-01")}
        recentClicks={[
          {
            id: "click1",
            timestamp: new Date("2024-02-01T10:30:00"),
            referer: "https://google.com",
            userAgent: "Mozilla/5.0",
          },
          {
            id: "click2",
            timestamp: new Date("2024-02-01T11:00:00"),
            referer: null,
            userAgent: "Chrome",
          },
        ]}
        baseUrl="https://short.url"
      />,
    );

    // Check that recent clicks summary is visible
    expect(screen.getByText(/Recent Clicks \(2\)/)).toBeInTheDocument();
  });

  it("should display original URL as clickable link", () => {
    render(
      <UrlCard
        shortCode="abc123"
        originalUrl="https://example.com/very-long-url"
        clickCount={5}
        createdAt={new Date("2024-01-01")}
        recentClicks={[]}
        baseUrl="https://short.url"
      />,
    );

    const originalLink = screen.getByRole("link", {
      name: "https://example.com/very-long-url",
    });
    expect(originalLink).toHaveAttribute(
      "href",
      "https://example.com/very-long-url",
    );
    expect(originalLink).toHaveAttribute("target", "_blank");
    expect(originalLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should format creation dates correctly", () => {
    render(
      <UrlCard
        shortCode="abc123"
        originalUrl="https://example.com/url"
        clickCount={1}
        createdAt={new Date("2024-01-15")}
        recentClicks={[]}
        baseUrl="https://short.url"
      />,
    );

    // Check that date is displayed (format: Jan 15, 2024)
    expect(screen.getByText(/Created Jan 15, 2024/)).toBeInTheDocument();
  });

  it("should show open in new tab link", () => {
    render(
      <UrlCard
        shortCode="abc123"
        originalUrl="https://example.com/url"
        clickCount={1}
        createdAt={new Date("2024-01-15")}
        recentClicks={[]}
        baseUrl="https://short.url"
      />,
    );

    const openLink = screen.getByLabelText("Open shortened URL in new tab");
    expect(openLink).toHaveAttribute("href", "https://short.url/s/abc123");
    expect(openLink).toHaveAttribute("target", "_blank");
  });
});
