import { test } from "node:test";
import assert from "node:assert/strict";
import { DataSourceError, fetchJson } from "./http-client.ts";

test("Firebase socket failures wrapped by fetch become safe socket errors", async (t) => {
  t.mock.method(globalThis, "fetch", async () => {
    throw new TypeError("fetch failed", { cause: Object.assign(new Error("private upstream details"), { code: "UND_ERR_SOCKET" }) });
  });
  await assert.rejects(fetchJson(new URL("https://example.test/scores")), (error: unknown) => {
    assert.ok(error instanceof DataSourceError);
    assert.equal(error.code, "socket");
    assert.equal(error.message.includes("private upstream"), false);
    return true;
  });
});

test("connection resets and DNS failures can be shown as connection alerts", async (t) => {
  for (const code of ["ECONNRESET", "ECONNREFUSED", "ENOTFOUND"]) {
    const stub = t.mock.method(globalThis, "fetch", async () => { throw Object.assign(new Error("upstream"), { code }); });
    await assert.rejects(fetchJson(new URL("https://example.test/scores")), (error: unknown) => error instanceof DataSourceError && error.code === "socket");
    stub.mock.restore();
  }
});

test("request timeouts remain distinguishable from socket disconnects", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new DOMException("Timed out", "TimeoutError"); });
  await assert.rejects(fetchJson(new URL("https://example.test/scores")), (error: unknown) => error instanceof DataSourceError && error.code === "timeout");
});

test("successful responses still return the JSON payload", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ match: [] }));
  assert.deepEqual(await fetchJson(new URL("https://example.test/scores")), { match: [] });
});
