// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { ResultCard } from "./result-card";

const SHORT_URL = "http://localhost:3000/s/abc1234";

afterEach(cleanup);

describe("ResultCard", () => {
  it("shows the short URL with a link to open it", () => {
    render(<ResultCard shortUrl={SHORT_URL} />);

    expect(screen.getByText(SHORT_URL)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open" }).getAttribute("href")).toBe(SHORT_URL);
  });

  it("copies the short URL and shows a visible confirmation", async () => {
    // userEvent.setup() installs an in-memory clipboard on navigator.
    const user = userEvent.setup();
    render(<ResultCard shortUrl={SHORT_URL} />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(await navigator.clipboard.readText()).toBe(SHORT_URL);
    expect(screen.getByRole("status").textContent).toBe("Copied to clipboard");
    expect(screen.getByRole("button", { name: "Copied!" })).toBeTruthy();
  });
});
