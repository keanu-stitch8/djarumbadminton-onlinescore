import { test } from "node:test";
import assert from "node:assert/strict";
import { mapCourtMatch, mapScoreboard, mapSourceTimestamp } from "./scores-mapper.ts";

test("score ownership follows team fields even when physical side order swaps", () => {
  const result = mapCourtMatch({ court: "1", kelompok_pertandingan: " MS-U13 ",
    side1_fullname_p1: "NAWAF", side2_fullname_p1: "MIRZA",
    team1_fullname_p1: " MIRZA   UKAIL S ", team2_fullname_p1: " NAWAF AL A ",
    team1set1: "16", team2set1: "17", team1set2: "0", team2set2: "0",
    team2_service: "http://192.168.254.200/view/shuttle.png",
  });
  assert.ok(result);
  assert.deepEqual(result.sides[0].players, ["MIRZA UKAIL S"]);
  assert.deepEqual(result.sides[1].players, ["NAWAF AL A"]);
  assert.deepEqual(result.sides[0].scores, [16, 0, null]);
  assert.deepEqual(result.sides[1].scores, [17, 0, null]);
  assert.equal(result.sides[1].serving, true);
  assert.equal(JSON.stringify(result).includes("192.168"), false);
});

test("missing and malformed scores remain missing, distinct from numeric zero", () => {
  const result = mapCourtMatch({ court: 2, team1_fullname: "Player", team1set1: "", team1set2: 0, team1set3: false,
    team2set1: -1, team2set2: "31", team2set3: "NaN" });
  assert.ok(result);
  assert.deepEqual(result.sides[0].scores, [null, 0, null]);
  assert.deepEqual(result.sides[1].scores, [null, null, null]);
});

test("empty courts remain representable and blank doubles partners are omitted", () => {
  const empty = mapCourtMatch({ court: 11, team1_fullname_p1: " ", team2_fullname_p1: "" });
  assert.ok(empty);
  assert.equal(empty.available, false);
  const doubles = mapCourtMatch({ court: "03", team1_fullname_p1: " One ", team1_fullname_p2: " Two ", team2_fullname_p1: " Three ", team2_fullname_p2: " " });
  assert.ok(doubles);
  assert.equal(doubles.court, "3");
  assert.deepEqual(doubles.sides[0].players, ["One", "Two"]);
  assert.deepEqual(doubles.sides[1].players, ["Three"]);
});

test("unusable court identifiers are rejected", () => {
  for (const court of [undefined, null, "", "unknown", 0, -1, 1.5, true]) assert.equal(mapCourtMatch({ court }), null);
});

test("source timestamps accept milliseconds, seconds and ISO dates without fabricating freshness", () => {
  assert.equal(mapSourceTimestamp(1794302394832), "2026-11-10T09:19:54.832Z");
  assert.equal(mapSourceTimestamp(1794302394), "2026-11-10T09:19:54.000Z");
  assert.equal(mapSourceTimestamp("2026-11-10T08:39:54.832Z"), "2026-11-10T08:39:54.832Z");
  for (const invalid of [null, undefined, "", "bad-date", {}, true]) assert.equal(mapSourceTimestamp(invalid), null);
});

test("mapScoreboard validates the feed root and sorts courts numerically", () => {
  const result = mapScoreboard({ updatedAt: 1794309875128, match: [null, { court: "10", team1_fullname: "B" }, { court: "2", team1_fullname: "A" }] });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.data.matches.map((m) => m.court), ["2", "10"]);
  assert.equal(result.data.sourceUpdatedAt, new Date(1794309875128).toISOString());
});

test("mapScoreboard reports missing and invalid feeds instead of an empty board", () => {
  assert.deepEqual(mapScoreboard(null), { ok: false, code: "missing" });
  assert.deepEqual(mapScoreboard([]), { ok: false, code: "invalid" });
  assert.deepEqual(mapScoreboard({ match: "x" }), { ok: false, code: "invalid" });
  assert.deepEqual(mapScoreboard({ match: [{ court: "abc" }] }), { ok: false, code: "invalid" });
  assert.deepEqual(mapScoreboard({ match: [{ court: 1 }, { court: "1" }] }), { ok: false, code: "invalid" });
  const empty = mapScoreboard({ match: null });
  assert.ok(empty.ok && empty.data.matches.length === 0);
});

test("cleared courts after a match ends stay on the board as empty courts", () => {
  const result = mapScoreboard({ updatedAt: 1, match: [{ court: "1", team1_fullname_p1: "A", team2_fullname_p1: "B" }, { court: 7 }] });
  assert.ok(result.ok);
  assert.deepEqual(result.data.matches.map((m) => [m.court, m.available]), [["1", true], ["7", false]]);
});

test("an entry cleared down to a blank court is skipped instead of failing the whole board", () => {
  const result = mapScoreboard({ match: [{ court: "1", team1_fullname: "A" }, { court: "", team1_fullname_p1: "" }, {}] });
  assert.ok(result.ok);
  assert.deepEqual(result.data.matches.map((m) => m.court), ["1"]);
});

test("a feed whose match list was removed entirely shows an empty board", () => {
  // Firebase drops keys whose value becomes empty, so clearing every court removes "match".
  const result = mapScoreboard({ updatedAt: 1794309875128 });
  assert.ok(result.ok);
  assert.equal(result.data.matches.length, 0);
});
