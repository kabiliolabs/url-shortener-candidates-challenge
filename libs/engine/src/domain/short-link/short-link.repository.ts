import type { ShortCode } from "./short-code";
import type { ShortLink } from "./short-link";

/** Port: persistence of the ShortLink aggregate. */
export interface ShortLinkRepository {
  /**
   * Persists a new link.
   * @throws ShortCodeAlreadyExistsError if the code is taken. Implementations must
   * rely on an atomic uniqueness guarantee (e.g. DB unique constraint), not on a
   * check-then-insert, so concurrent creations stay race-safe.
   */
  save(link: ShortLink): Promise<void>;

  /** Returns the link for the code, or null when it does not exist. */
  findByCode(code: ShortCode): Promise<ShortLink | null>;
}
