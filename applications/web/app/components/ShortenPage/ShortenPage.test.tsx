import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { ShortenPage } from "./ShortenPage";
import * as api from "../../api/client";
import { queryClient } from "../../query-client.js";

vi.mock("../../api/client");

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>{children}</JotaiProvider>
    </QueryClientProvider>
  );
}

describe("ShortenPage", () => {
  it("renders form with URL input and Shorten button", () => {
    render(
      <TestWrapper>
        <ShortenPage />
      </TestWrapper>
    );
    expect(screen.getByLabelText("URL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Shorten" })).toBeInTheDocument();
  });

  it("shows error when submitting empty URL", async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <ShortenPage />
      </TestWrapper>
    );
    await user.click(screen.getByRole("button", { name: "Shorten" }));
    // Match error message (apostrophe may be straight or curly)
    expect(screen.getByText(/You didn.t enter a URL.+full web address/i)).toBeInTheDocument();
  });

  it("calls shortenUrl and shows result on success", async () => {
    const user = userEvent.setup();
    vi.mocked(api.shortenUrl).mockResolvedValue({
      shortenedUrl: "https://app.com/s/abc123",
    });
    render(
      <TestWrapper>
        <ShortenPage />
      </TestWrapper>
    );
    await user.type(screen.getByLabelText("URL"), "https://example.com");
    await user.click(screen.getByRole("button", { name: "Shorten" }));
    expect(api.shortenUrl).toHaveBeenCalledWith("https://example.com");
    expect(await screen.findByLabelText("Shortened URL")).toBeInTheDocument();
    expect(screen.getByDisplayValue("https://app.com/s/abc123")).toBeInTheDocument();
  });
});
