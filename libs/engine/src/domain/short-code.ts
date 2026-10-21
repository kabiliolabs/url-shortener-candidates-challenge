import { randomInt as cryptoRandomInt } from "node:crypto";
import { InvalidShortCodeError } from "./errors";

/**
 * Value object for the short code.
 *
 * The original generator used 2 characters out of "abc" => 3^2 = 9 possible
 * codes, so collisions were a certainty (~50% chance after just 4 URLs) and a
 * collision silently overwrote someone else's link.
 *
 * Here: 7 characters out of a 56-symbol unambiguous alphabet => 56^7 ≈ 1.7e12
 * combinations, generated with a CSPRNG (`node:crypto`) rather than
 * `Math.random()`, which is predictable and would let anyone enumerate links.
 */
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const LENGTH = 7;
const MAX_PARSE_LENGTH = 32;

/** Injected source of randomness, so code generation is deterministic in tests. */
export type RandomIntSource = (maxExclusive: number) => number;

export const secureRandomInt: RandomIntSource = (maxExclusive) =>
  cryptoRandomInt(maxExclusive);

export class ShortCode {
  private constructor(readonly value: string) {}

  static random(randomInt: RandomIntSource = secureRandomInt): ShortCode {
    let value = "";
    for (let i = 0; i < LENGTH; i++) {
      value += ALPHABET[randomInt(ALPHABET.length)];
    }
    return new ShortCode(value);
  }

  /** Rebuilds a code coming from the outside world (a URL param or the database). */
  static parse(raw: unknown): ShortCode {
    if (typeof raw !== "string" || raw.length === 0) {
      throw new InvalidShortCodeError("Missing short code.");
    }
    if (raw.length > MAX_PARSE_LENGTH) {
      throw new InvalidShortCodeError("Short code is too long.");
    }
    for (const char of raw) {
      if (!ALPHABET.includes(char)) {
        throw new InvalidShortCodeError(`Invalid character in short code: "${char}".`);
      }
    }
    return new ShortCode(raw);
  }

  equals(other: ShortCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export const SHORT_CODE_ALPHABET = ALPHABET;
export const SHORT_CODE_LENGTH = LENGTH;
