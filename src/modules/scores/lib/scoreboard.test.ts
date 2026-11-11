import { test } from "node:test";
import assert from "node:assert/strict";
import { filterMatches, currentGame, isBoardIdle, isSourceStale, countryFlag, matchProgress, venueHeading, pointStatus, footerMessage } from "./scoreboard.ts";
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

test("the board is idle only when every court is waiting or there are no courts", () => {
  const waiting = mapCourtMatch({ court: 3, team1set1: "", team2set1: "" })!;
  assert.equal(isBoardIdle([]), true);
  assert.equal(isBoardIdle([waiting, { ...waiting, id: "court-4", court: "4" }]), true);
  assert.equal(isBoardIdle([waiting, first]), false);
});

test("two valid game wins identify the winner, including the 30-point cap", () => {
  const completed = mapCourtMatch({ court: 9, team1set1: 9, team2set1: 21, team1set2: 4, team2set2: 21 })!;
  assert.deepEqual(matchProgress(completed), { winner: 1, started: true });
  const capped = mapCourtMatch({ court: 2, team1set1: 30, team2set1: 29, team1set2: 22, team2set2: 20 })!;
  assert.deepEqual(matchProgress(capped), { winner: 0, started: true });
});

test("the Jati feed gets its age groups in the title and the venue as subtitle", () => {
  assert.deepEqual(venueHeading("bdmntn-jati"), {
    title: "MilkLife Indonesia Junior International Series 2026 (U17, U15, U13)",
    subtitle: "GOR Djarum, Jati, Kudus, Indonesia",
  });
  assert.deepEqual(venueHeading("/bdmntn-jati/"), venueHeading("bdmntn-jati"));
});

test("other feeds keep the plain event title without a subtitle", () => {
  assert.deepEqual(venueHeading("bdmntn-other"), { title: "MilkLife Indonesia Junior International Series 2026", subtitle: null });
});

test("the Kaliputu feed gets U19 in the title, whichever prefix spelling the feed uses", () => {
  for (const path of ["bdmntn-kaliputu", "bdmtn-kaliputu"]) {
    assert.deepEqual(venueHeading(path), { title: "MilkLife Indonesia Junior International Series 2026 (U19)", subtitle: null });
  }
});

test("participating countries use the local flag-icons SVGs", () => {
  for (const [code, file, name] of [["MAS", "my", "Malaysia"], ["PHI", "ph", "Filipina"], ["SGP", "sg", "Singapura"], ["AUT", "at", "Austria"], ["FRA", "fr", "Prancis"], ["USA", "us", "Amerika Serikat"]]) {
    assert.deepEqual(countryFlag(code), { flag: `/flags/${file}.svg`, name });
  }
});

test("Chinese Taipei uses its local Olympic flag, never the ROC flag from flagcdn", () => {
  assert.deepEqual(countryFlag("TPE"), { flag: "/flags/tpe.png", name: "Chinese Taipei" });
  assert.deepEqual(countryFlag("tpe"), { flag: "/flags/tpe.png", name: "Chinese Taipei" });
});

test("game point goes to the side one rally from winning the active game, never after it ends", () => {
  const point = (raw: Record<string, unknown>) => pointStatus(mapCourtMatch({ court: 1, ...raw })!);
  assert.deepEqual(point({ team1set1: 20, team2set1: 14 }), ["game", null]);
  assert.deepEqual(point({ team1set1: 18, team2set1: 20 }), [null, "game"]);
  assert.deepEqual(point({ team1set1: 19, team2set1: 19 }), [null, null]);
  assert.deepEqual(point({ team1set1: 20, team2set1: 20 }), [null, null]);
  assert.deepEqual(point({ team1set1: 24, team2set1: 23 }), ["game", null]);
  assert.deepEqual(point({ team1set1: 29, team2set1: 29 }), ["game", "game"]);
  // Finished games (the screenshot's lingering "Game Point" cases): 21-14 and 17-21, next game 0-0.
  assert.deepEqual(point({ team1set1: 19, team2set1: 21, team1set2: 21, team2set2: 14, team1set3: 0, team2set3: 0 }), [null, null]);
  assert.deepEqual(point({ team1set1: 17, team2set1: 21, team1set2: 0, team2set2: 0 }), [null, null]);
});

test("game point becomes match point for a side that already won a game", () => {
  const point = (raw: Record<string, unknown>) => pointStatus(mapCourtMatch({ court: 1, ...raw })!);
  assert.deepEqual(point({ team1set1: 21, team2set1: 15, team1set2: 20, team2set2: 10 }), ["match", null]);
  assert.deepEqual(point({ team1set1: 21, team2set1: 15, team1set2: 10, team2set2: 20 }), [null, "game"]);
  assert.deepEqual(point({ team1set1: 21, team2set1: 15, team1set2: 15, team2set2: 21, team1set3: 20, team2set3: 20 }), [null, null]);
  assert.deepEqual(point({ team1set1: 21, team2set1: 15, team1set2: 15, team2set2: 21, team1set3: 21, team2set3: 20 }), ["match", null]);
  assert.deepEqual(point({ team1set1: 21, team2set1: 15, team1set2: 21, team2set2: 19 }), [null, null]);
});

test("the footer drops feed game/match point text but keeps other messages", () => {
  assert.equal(footerMessage("Game Point"), "");
  assert.equal(footerMessage("MATCH POINT"), "");
  assert.equal(footerMessage("Interval"), "Interval");
});
