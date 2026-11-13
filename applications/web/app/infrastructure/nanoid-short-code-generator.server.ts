import { nanoid } from "nanoid";
import type { ShortCodeGenerator } from "@url-shortener/engine";

/** Adaptador del generador de códigos del dominio basado en Nano ID. */
export class NanoidShortCodeGenerator implements ShortCodeGenerator {
  /** Genera códigos de ocho caracteres; la unicidad se confirma al persistir. */
  generate(): string {
    return nanoid(8);
  }
}
