import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { logger } from "~/server/lib/logger.server";
import { registerShutdownHooks } from "~/server/lib/shutdown.server";

registerShutdownHooks();

const ABORT_DELAY = 5_000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const readyOption: keyof RenderToPipeableStreamOptions =
      userAgent && isbot(userAgent) ? "onAllReady" : "onShellReady";

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          responseHeaders.set("X-Content-Type-Options", "nosniff");
          responseHeaders.set("X-Frame-Options", "DENY");
          responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
          responseHeaders.set("X-DNS-Prefetch-Control", "off");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          logger.error({ err: error }, "SSR shell render failed");
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          if (shellRendered) {
            logger.error({ err: error }, "Streaming SSR error");
          }
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export function handleError(
  error: unknown,
  { request }: { request: Request }
) {
  if (request.signal.aborted) return;
  logger.error({ err: error, url: request.url }, "Unhandled server error");
}
