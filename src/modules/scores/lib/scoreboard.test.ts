import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMatches, currentGame, isSourceStale, countryFlag, matchProgress } from "./scoreboard.ts";
import { mapCourtMatch } from "../mappers/scores-mapper.ts";

const first = mapCourtMatch({ court: 1, kelompok_pertandingan: "MS-U13", team1_fullname: "MIRZA", team1_club1: "INA", team1set1: "21", team2set1: "19", team1set2: "0", team1set3: "0" })!;
const second = mapCourtMatch({ court: 2, kelompok_pertandingan: "WD-U17", team1_fullname: "PLAYER TWO", team1_club1: "TPE", team1set1: "21", team1set2: "5", team2set2: "8", team1set3: "0" })!;

test("filters compose by category, court, normalized player search and country", () => {
  assert.equal(filterMatches([first, second], "all", "all", "  mirza ")[0].court, "1");
  assert.equal(filterMatches([first, second], "WD-U17", "2", "TPE").length, 1);
  assert.equal(filterMatches([first, second], "MS-U13", "2", "").length, 0);
  assert.equal(filterMatches([first, second], "all", "all", "nothing").length, 0);
});

test("last game with a recorded point is highlighted; unused zero games do not advance it", () => {
  assert.equal(currentGame(first), 0);
  assert.equal(currentGame(second), 1);
});

test("old or absent source timestamps remain stale regardless of a successful recent fetch", () => {
  const now = Date.parse("2026-11-10T09:00:00Z");
  assert.equal(isSourceStale(null, now), true);
  assert.equal(isSourceStale("2026-11-10T08:55:00Z", now), true);
  assert.equal(isSourceStale("2026-11-10T08:59:00Z", now), false);
});

test("unknown country codes do not generate unrelated flags", () => {
  assert.equal(countryFlag("INA").name, "Indonesia");
  assert.equal(countryFlag("INA").flag, "/flags/id.svg");
  assert.equal(countryFlag("CLUB").flag, "");
});

test("one completed game and deuce do not establish a match winner", () => {
  assert.deepEqual(matchProgress(first), { winner: null, started: true });
  const deuce = mapCourtMatch({ court: 1, team1set1: 21, team2set1: 20, team1set2: 21, team2set2: 20 })!;
  assert.deepEqual(matchProgress(deuce), { winner: null, started: true });
  const waiting = mapCourtMatch({ court: 11, team1set1: 0, team2set1: 0 })!;
  assert.deepEqual(matchProgress(waiting), { winner: null, started: false });
});

test("two valid game wins identify the winner, including the 30-point cap", () => {
  const completed = mapCourtMatch({ court: 9, team1set1: 9, team2set1: 21, team1set2: 4, team2set2: 21 })!;
  assert.deepEqual(matchProgress(completed), { winner: 1, started: true });
  const capped = mapCourtMatch({ court: 2, team1set1: 30, team2set1: 29, team1set2: 22, team2set2: 20 })!;
  assert.deepEqual(matchProgress(capped), { winner: 0, started: true });
});
