import type { Clock } from "@url-shortener/engine";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
