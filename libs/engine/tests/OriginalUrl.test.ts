import { describe, it, expect } from 'vitest';
import { OriginalUrl } from '../src/domain/value-objects/OriginalUrl';
import { InvalidUrlError } from '../src/domain/errors/UrlErrors';

describe('OriginalUrl Value Object', () => {
  it('should create a valid http OriginalUrl', () => {
    const urlStr = 'http://example.com/path?query=1';
    const original = OriginalUrl.create(urlStr);
    expect(original.getValue).toBe(urlStr);
  });

  it('should create a valid https OriginalUrl', () => {
    const urlStr = 'https://www.google.com';
    const original = OriginalUrl.create(urlStr);
    expect(original.getValue).toBe(urlStr);
  });

  it('should throw an error for empty URLs', () => {
    expect(() => OriginalUrl.create('')).toThrow(InvalidUrlError);
    expect(() => OriginalUrl.create('   ')).toThrow(InvalidUrlError);
  });

  it('should throw an error for totally invalid formats', () => {
    expect(() => OriginalUrl.create('not-a-url')).toThrow(InvalidUrlError);
  });

  it('should throw an error for bad protocols (e.g. javascript:, ftp:)', () => {
    expect(() => OriginalUrl.create('javascript:alert(1)')).toThrow(InvalidUrlError);
    expect(() => OriginalUrl.create('ftp://files.example.com')).toThrow(InvalidUrlError);
    expect(() => OriginalUrl.create('wss://socket.example.com')).toThrow(InvalidUrlError);
  });
});
