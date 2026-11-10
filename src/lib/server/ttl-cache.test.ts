import { test } from "node:test";
import assert from "node:assert/strict";
import { createCachedLoader } from "./ttl-cache.ts";

test("reuses a fresh value instead of loading again", async () => {
  let clock = 0;
  let calls = 0;
  const get = createCachedLoader(async () => ++calls, 1_500, () => clock);
  assert.equal(await get(), 1);
  clock = 1_499;
  assert.equal(await get(), 1);
  clock = 1_500;
  assert.equal(await get(), 2);
  assert.equal(calls, 2);
});

test("concurrent callers share one in-flight load", async () => {
  let calls = 0;
  let release!: (value: string) => void;
  const get = createCachedLoader(() => { calls++; return new Promise<string>((resolve) => { release = resolve; }); }, 1_500, () => 0);
  const pending = Promise.all([get(), get(), get()]);
  release("scores");
  assert.deepEqual(await pending, ["scores", "scores", "scores"]);
  assert.equal(calls, 1);
});

test("failures are not cached, so the next call retries", async () => {
  let calls = 0;
  const get = createCachedLoader(async () => { if (++calls === 1) throw new Error("down"); return "ok"; }, 1_500, () => 0);
  await assert.rejects(get(), /down/);
  assert.equal(await get(), "ok");
  assert.equal(calls, 2);
});

test("the TTL starts when the load finishes, not when it starts", async () => {
  let clock = 0;
  let calls = 0;
  const get = createCachedLoader(async () => { calls++; clock += 1_000; return calls; }, 1_500, () => clock);
  assert.equal(await get(), 1); // finished at 1000, fresh until 2500
  clock = 2_400;
  assert.equal(await get(), 1);
  assert.equal(calls, 1);
});
