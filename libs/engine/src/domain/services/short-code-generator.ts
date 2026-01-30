import crypto from 'node:crypto';
import { ShortCode } from '../value-objects/short-code';
import type { UrlRepositoryPort } from '../../ports/url-repository-port';

export class ShortCodeGenerator {
  static readonly BASE62_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  static readonly CODE_LENGTH = 7;

  constructor(private readonly repository: UrlRepositoryPort) { }

  async generate(): Promise<ShortCode> {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
      const codeStr = this.generateRandomBase62();
      if (!(await this.repository.exists(codeStr))) {
        return new ShortCode(codeStr);
      }
      attempts++;
    }
    throw new Error('Failed to generate unique short code after max attempts');
  }

  private generateRandomBase62(): string {
    let code = '';
    for (let i = 0; i < ShortCodeGenerator.CODE_LENGTH; i++) {
      const byte = crypto.getRandomValues(new Uint8Array(1))[0];
      code += ShortCodeGenerator.BASE62_CHARS[byte % ShortCodeGenerator.BASE62_CHARS.length];
    }
    return code;
  }
}