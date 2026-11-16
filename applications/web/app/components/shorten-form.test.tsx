// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ShortenForm } from "./shorten-form";

afterEach(cleanup);

function renderForm(action: () => unknown) {
  const Stub = createRoutesStub([
    {
      path: "/",
      Component: () => (
        <ShortenForm ownHostname="short.example" shortUrlPrefix="https://short.example/s/" />
      ),
      action,
    },
  ]);
  render(<Stub initialEntries={["/"]} />);

  return {
    input: screen.getByLabelText("Long URL") as HTMLInputElement,
    button: () => screen.getByRole("button") as HTMLButtonElement,
  };
}

describe("ShortenForm", () => {
  it("shows an inline error for an invalid URL, keeps the value and does not submit", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => null);
    const { input, button } = renderForm(action);

    await user.type(input, "ftp://example.com");
    await user.click(button());

    expect(await screen.findByText("Only http and https URLs are allowed")).toBeTruthy();
    expect(input.value).toBe("ftp://example.com");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(action).not.toHaveBeenCalled();
  });

  it("disables the submit button and shows a loading indicator while the request is pending", async () => {
    const user = userEvent.setup();
    const action = vi.fn(() => new Promise(() => {}));
    const { input, button } = renderForm(action);

    await user.type(input, "https://example.com/long");
    await user.click(button());

    await waitFor(() => expect(button().disabled).toBe(true));
    expect(button().textContent).toContain("Shortening…");
    expect(action).toHaveBeenCalledTimes(1);
  });
});
