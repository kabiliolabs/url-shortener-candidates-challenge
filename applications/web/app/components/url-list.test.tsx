// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { UrlList } from "./url-list";

afterEach(cleanup);

const LONG_URL = `https://example.com/${"segment/".repeat(20)}`;

describe("UrlList", () => {
  it("shows a loading state", () => {
    render(<UrlList state={{ status: "loading" }} />);

    expect(screen.getByRole("status").textContent).toBe("Loading links…");
  });

  it("shows an empty state, not an error, when there are no URLs", () => {
    render(<UrlList state={{ status: "ready", urls: [] }} />);

    expect(screen.getByText("No links yet. Shorten your first URL above.")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error state describing that the list could not be loaded", () => {
    render(<UrlList state={{ status: "error", message: "Can't reach the server." }} />);

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Couldn't load the links");
    expect(alert.textContent).toContain("Can't reach the server.");
  });

  it("lists each URL with its short link, clicks and creation date", () => {
    render(
      <UrlList
        state={{
          status: "ready",
          urls: [
            {
              code: "abc1234",
              shortUrl: "http://localhost:3000/s/abc1234",
              originalUrl: LONG_URL,
              clicks: 7,
              createdAt: "2026-11-16T10:00:00.000Z",
            },
          ],
        }}
      />,
    );

    const [, row] = screen.getAllByRole("row");
    const cells = row.querySelectorAll("td");
    expect(cells[0].querySelector("span")?.getAttribute("title")).toBe(LONG_URL);
    expect(
      screen.getByRole("link", { name: "localhost:3000/s/abc1234" }).getAttribute("href"),
    ).toBe("http://localhost:3000/s/abc1234");
    expect(cells[2].textContent).toBe("7");
    expect(cells[3].querySelector("time")?.getAttribute("dateTime")).toBe(
      "2026-11-16T10:00:00.000Z",
    );
  });
});
