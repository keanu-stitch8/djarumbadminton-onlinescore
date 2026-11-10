import { test } from "node:test";
import assert from "node:assert/strict";
import { applyStreamEvent } from "./firebase-stream.ts";

test("put at the root replaces the whole tree", () => {
  assert.deepEqual(applyStreamEvent({ old: 1 }, "put", { path: "/", data: { match: [] } }), { match: [] });
});

test("put at a nested path updates only that value without mutating the previous tree", () => {
  const before = { updatedAt: 1, match: [{ court: "1", team1set1: "3" }, { court: "2" }] };
  const after = applyStreamEvent(before, "put", { path: "/match/0/team1set1", data: "4" }) as typeof before;
  assert.equal(after.match[0].team1set1, "4");
  assert.equal(before.match[0].team1set1, "3");
  assert.equal(after.match[1], before.match[1]);
  assert.ok(Array.isArray(after.match));
});

test("put with null deletes the value", () => {
  assert.deepEqual(applyStreamEvent({ a: { b: 1, c: 2 } }, "put", { path: "/a/b", data: null }), { a: { c: 2 } });
});

test("patch merges each child under the path", () => {
  const after = applyStreamEvent({ match: [{ court: "1", team1set1: "3", team2set1: "5" }], updatedAt: 1 }, "patch",
    { path: "/match/0", data: { team1set1: "4", team2set1: null } });
  assert.deepEqual(after, { match: [{ court: "1", team1set1: "4" }], updatedAt: 1 });
});

test("put creates missing parents", () => {
  assert.deepEqual(applyStreamEvent(null, "put", { path: "/match/0/court", data: "1" }), { match: { 0: { court: "1" } } });
});
