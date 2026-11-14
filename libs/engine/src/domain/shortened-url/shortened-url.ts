import type { URL } from "../url/url";

export class ShortenedURL {
  constructor(
    public readonly code: string,
    public readonly destination: URL,
  ) {
    Object.freeze(this);
  }
}
