import type { ShortCode } from "../value-objects/short-code";

export interface IShortCodeGenerator {
  generate(): ShortCode;
}
