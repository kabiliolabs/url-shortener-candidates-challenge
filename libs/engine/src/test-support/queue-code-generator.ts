import type { CodeGenerator } from "../domain/ports/code-generator";
import { ShortCode } from "../domain/short-code";

/**
 * Yields short codes from a predetermined queue. Useful for collision-retry
 * tests where the test wants to control exactly which codes are produced.
 */
export class QueueCodeGenerator implements CodeGenerator {
  constructor(private readonly queue: string[]) {}

  generate(): ShortCode {
    const next = this.queue.shift();
    if (next === undefined) {
      throw new Error("QueueCodeGenerator exhausted");
    }
    return ShortCode.fromTrusted(next);
  }
}
