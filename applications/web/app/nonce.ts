import { createContext } from "react";

/**
 * Per-request CSP nonce. The server entry generates one, advertises it in the
 * `script-src` directive, and provides it here so <Scripts>/<ScrollRestoration>
 * stamp React Router's inline bootstrap scripts with the matching nonce. That
 * lets us keep a strict `script-src 'self'` (no 'unsafe-inline') while still
 * allowing hydration. It is `undefined` on the client, where those scripts have
 * already executed and the browser has stripped the nonce attribute anyway.
 */
export const NonceContext = createContext<string | undefined>(undefined);
