import { randomInt } from "node:crypto";
import { ShortCode, type ShortCodeGenerator } from "../../domain";

type RandomIndex = (max: number) => number;

export class CryptoShortCodeGenerator implements ShortCodeGenerator {
  constructor(private readonly randomIndex: RandomIndex = randomInt) {}

  generate(): ShortCode {
    const { ALPHABET, LENGTH } = ShortCode;
    let value = "";
    for (let i = 0; i < LENGTH; i++) {
      value += ALPHABET[this.randomIndex(ALPHABET.length)];
    }
    return ShortCode.create(value);
  }
}
