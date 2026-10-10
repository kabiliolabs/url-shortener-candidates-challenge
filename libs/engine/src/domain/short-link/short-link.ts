import { DestinationUrl } from "./destination-url";
import { ShortCode } from "./short-code";

export interface ShortLinkPrimitives {
  code: string;
  destination: string;
  createdAt: Date;
}

/**
 * Aggregate root. Click counts are deliberately NOT part of it: no ShortLink
 * invariant depends on them, and keeping them out avoids write contention on
 * the aggregate for every redirect (clicks are appended as separate records).
 */
export class ShortLink {
  /** Trusted instantiation: does NOT validate (use `create` for new links). */
  constructor(
    readonly code: ShortCode,
    readonly destination: DestinationUrl,
    readonly createdAt: Date,
  ) {}

  // createdAt is injected (no `new Date()` here) to keep the domain deterministic.
  static create(props: { code: ShortCode; destination: DestinationUrl; createdAt: Date }): ShortLink {
    return new ShortLink(props.code, props.destination, props.createdAt);
  }

  toPrimitives(): ShortLinkPrimitives {
    return {
      code: this.code.value,
      destination: this.destination.value,
      createdAt: this.createdAt,
    };
  }
}
