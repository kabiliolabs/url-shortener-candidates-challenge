import { expect, it } from "vitest";
import { SystemClock } from "./system-clock";

it("returns the current system time", () => {
  const clock = new SystemClock();

  const before = Date.now();
  const now = clock.now().getTime();
  const after = Date.now();

  expect(now).toBeGreaterThanOrEqual(before);
  expect(now).toBeLessThanOrEqual(after);
});
