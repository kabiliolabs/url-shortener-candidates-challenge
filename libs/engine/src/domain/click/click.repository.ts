import type { Click } from "./click";

/** Port: append-only storage of clicks. */
export interface ClickRepository {
  record(click: Click): Promise<void>;
}
