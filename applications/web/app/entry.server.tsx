import { PassThrough } from "node:stream";
import { randomBytes } from "node:crypto";
import type { EntryContext } from "react-router";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { NonceContext } from "~/nonce";
import { securityHeaders } from "~/.server/security-headers";

export const streamTimeout = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    // Fresh nonce per request: advertised in the CSP and stamped on every
    // inline script (React's streaming runtime via the `nonce` option below,
    // React Router's bootstrap via <Scripts nonce> in root.tsx).
    const nonce = randomBytes(16).toString("base64");
    const userAgent = request.headers.get("user-agent");
    const readyOption =
      userAgent && isbot(userAgent) ? "onAllReady" : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <ServerRouter context={routerContext} url={request.url} />
      </NonceContext.Provider>,
      {
        nonce,
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          for (const [key, value] of Object.entries(securityHeaders(nonce))) {
            responseHeaders.set(key, value);
          }
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );
          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) console.error(error);
        },
      },
    );

    setTimeout(abort, streamTimeout + 1000);
  });
}
