import { maxBodyBytes } from "./config";

export class PayloadTooLargeError extends Error {
  constructor(public readonly maxBytes: number) {
    super(`Request body must be at most ${maxBytes} bytes`);
    this.name = "PayloadTooLargeError";
  }
}

async function readBodyText(request: Request, maxBytes: number): Promise<string> {
  // Fast path; the header can be absent or spoofed, so the read below is still capped.
  if (Number(request.headers.get("Content-Length")) > maxBytes) {
    throw new PayloadTooLargeError(maxBytes);
  }

  if (!request.body) {
    return "";
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      return text + decoder.decode();
    }

    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new PayloadTooLargeError(maxBytes);
    }
    text += decoder.decode(value, { stream: true });
  }
}

/** Reads an `application/x-www-form-urlencoded` body (what React Router's `<Form>` posts), aborting past `maxBytes`. */
export async function readFormFields(
  request: Request,
  maxBytes = maxBodyBytes,
): Promise<Record<string, string>> {
  const text = await readBodyText(request, maxBytes);
  return Object.fromEntries(new URLSearchParams(text));
}
