import type { ShortCode } from "../short-link/short-code";

export interface ClickPrimitives {
  shortCode: string;
  occurredAt: Date;
}

/** Immutable, append-only fact. It references its ShortLink by code only, never by object. */
export class Click {
  /** Trusted instantiation: does NOT validate (use `record` for new clicks). */
  constructor(
    readonly shortCode: ShortCode,
    readonly occurredAt: Date,
  ) {}

  static record(props: { shortCode: ShortCode; occurredAt: Date }): Click {
    return new Click(props.shortCode, props.occurredAt);
  }

  toPrimitives(): ClickPrimitives {
    return { shortCode: this.shortCode.value, occurredAt: this.occurredAt };
  }
}
