import { describe, expect, it } from "vitest";
import { PayloadTooLargeError, readFormFields } from "./request-body";

const MAX_BYTES = 16;

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  let pulled = 0;
  const stream = new ReadableStream<Uint8Array>(
    {
      pull(controller) {
        const chunk = chunks[pulled++];
        if (chunk === undefined) {
          controller.close();
        } else {
          controller.enqueue(encoder.encode(chunk));
        }
      },
    },
    // Only pull when the reader asks, so the pull count shows how much was read.
    { highWaterMark: 0 },
  );
  return { stream, pulledChunks: () => pulled };
}

function post(body: string | ReadableStream<Uint8Array>, headers: Record<string, string> = {}) {
  return new Request("http://localhost/", {
    method: "POST",
    body,
    headers,
    duplex: "half",
  } as RequestInit);
}

describe("readFormFields", () => {
  it("parses a urlencoded body within the limit", async () => {
    expect(await readFormFields(post("url=https%3A%2F%2Fa.io"), 64)).toEqual({
      url: "https://a.io",
    });
  });

  it("rejects up front when Content-Length exceeds the limit", async () => {
    const { stream, pulledChunks } = streamOf("url=x");

    await expect(
      readFormFields(post(stream, { "Content-Length": "1000" }), MAX_BYTES),
    ).rejects.toThrow(PayloadTooLargeError);
    expect(pulledChunks()).toBe(0);
  });

  it("aborts mid-stream once the bytes read exceed the limit, without a Content-Length", async () => {
    const { stream, pulledChunks } = streamOf("url=0123456789", "abcdefghij", "never-read");

    await expect(readFormFields(post(stream), MAX_BYTES)).rejects.toThrow(
      PayloadTooLargeError,
    );
    expect(pulledChunks()).toBe(2);
  });
});
