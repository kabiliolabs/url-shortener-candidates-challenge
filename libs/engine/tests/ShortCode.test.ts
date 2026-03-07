import { describe, it, expect } from 'vitest';
import { ShortCode } from '../src/domain/value-objects/ShortCode';
import { InvalidUrlError } from '../src/domain/errors/UrlErrors';

describe('ShortCode Value Object', () => {
  it('should create a valid ShortCode', () => {
    const code = ShortCode.create('aB3_r-');
    expect(code.getValue).toBe('aB3_r-');
  });

  it('should throw an error if the ShortCode is empty', () => {
    expect(() => ShortCode.create('')).toThrow(InvalidUrlError);
    expect(() => ShortCode.create('   ')).toThrow(InvalidUrlError);
  });

  it('should throw an error if the ShortCode is too long', () => {
    expect(() => ShortCode.create('a1b2c3d4e5f6')).toThrow(InvalidUrlError);
  });

  it('should throw an error if the ShortCode contains invalid characters', () => {
    expect(() => ShortCode.create('a*b')).toThrow(InvalidUrlError);
    expect(() => ShortCode.create('test!')).toThrow(InvalidUrlError);
    expect(() => ShortCode.create('sl/ash')).toThrow(InvalidUrlError);
  });
});
