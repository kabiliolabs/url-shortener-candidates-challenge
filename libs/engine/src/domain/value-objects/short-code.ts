export class ShortCode {
  static readonly ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
  static readonly LENGTH = 7;
  private static readonly VALID = /^[a-z0-9]{7}$/;

  constructor(readonly value: string) {
    if (!ShortCode.VALID.test(value)) {
      throw new Error(`Invalid ShortCode: "${value}"`);
    }
  }

  equals(other: ShortCode): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
