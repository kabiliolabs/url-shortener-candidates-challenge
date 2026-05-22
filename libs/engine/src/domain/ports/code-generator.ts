import type { ShortCode } from "../short-code";

export interface CodeGenerator {
  generate(): ShortCode;
}
