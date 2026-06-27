import { describe, expect, it } from 'vitest';
import { ValidationError } from './errors.js';
import { validateUrl } from './validate-url.js';

describe('validateUrl', () => {
  it('rejects empty string', () => {
    expect(() => validateUrl('   ')).toThrow(new ValidationError('URL is required'));
  });

  it('rejects malformed URLs', () => {
    expect(() => validateUrl('not-a-url')).toThrow(new ValidationError('URL is not valid'));
  });

  it('rejects non-http/https protocols', () => {
    expect(() => validateUrl('javascript:alert(1)')).toThrow(
      new ValidationError('URL must use http or https'),
    );
  });

  it('rejects URLs longer than 2048 characters', () => {
    const long = `https://example.com/${'a'.repeat(2048)}`;
    expect(() => validateUrl(long)).toThrow(
      new ValidationError('URL must be 2048 characters or fewer'),
    );
  });

  it('accepts and trims a valid https URL', () => {
    expect(validateUrl('  https://example.com/path  ')).toBe('https://example.com/path');
  });
});
