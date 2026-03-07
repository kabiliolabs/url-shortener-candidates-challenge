import type { IShortCodeGenerator } from '../domain/services/IShortCodeGenerator';
import { nanoid } from 'nanoid';

export class NanoidGenerator implements IShortCodeGenerator {
  generate(): string {
    return nanoid(10);
  }
}
