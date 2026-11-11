import type { CourtMatch } from "../types/scores.ts";

export function filterMatches(matches: CourtMatch[], category: string, court: string, search: string): CourtMatch[] {
  const query = search.trim().toLowerCase();
  return matches.filter((match) =>
    (category === "all" || match.category === category) &&
    (court === "all" || match.court === court) &&
    (!query || match.sides.some((side) => [...side.players, side.country].some((v) => v.toLowerCase().includes(query)))),
  );
}

export function currentGame(match: CourtMatch): number {
  for (let i = 2; i >= 1; i--) {
    if (match.sides.some((s) => (s.scores[i] ?? 0) > 0)) return i;
  }
  return 0;
}

// Flags served from public/flags instead of flagcdn: the 4:3 SVGs from flag-icons
// (https://flagicons.lipis.dev, MIT) for the participating countries. Chinese Taipei competes under
// the Chinese Taipei Olympic flag, not the ROC flag flag packs serve for "TW", so it keeps its own file.
const localFlags: Record<string, string> = {
  INA: "/flags/id.svg", IDN: "/flags/id.svg", MAS: "/flags/my.svg", PHI: "/flags/ph.svg",
  SGP: "/flags/sg.svg", TPE: "/flags/tpe.png", AUT: "/flags/at.svg", FRA: "/flags/fr.svg",
  USA: "/flags/us.svg",
};

// [ISO code for flagcdn, display name]. An empty ISO code means the flag is local-only.
const countries: Record<string, [string, string]> = {
  INA: ["ID", "Indonesia"], IDN: ["ID", "Indonesia"], TPE: ["", "Chinese Taipei"],
  CHN: ["CN", "China"], MAS: ["MY", "Malaysia"], THA: ["TH", "Thailand"],
  JPN: ["JP", "Jepang"], KOR: ["KR", "Korea Selatan"], IND: ["IN", "India"],
  SGP: ["SG", "Singapura"], VIE: ["VN", "Vietnam"], HKG: ["HK", "Hong Kong"],
  AUS: ["AU", "Australia"], ENG: ["GB", "Inggris"], DEN: ["DK", "Denmark"],
  PHI: ["PH", "Filipina"], USA: ["US", "Amerika Serikat"], CAN: ["CA", "Kanada"],
  AUT: ["AT", "Austria"], FRA: ["FR", "Prancis"],
};

export function countryFlag(code: string): { flag: string; name: string } {
  const key = code.toUpperCase();
  const country = countries[key];
  if (!country) return { flag: "", name: code };
  const local = localFlags[key];
  if (local) return { flag: local, name: country[1] };
  return { flag: country[0] ? `https://flagcdn.com/${country[0].toLowerCase()}.svg` : "", name: country[1] };
}

// A badminton game is won at 21 with a two-point margin, or at the 30-point cap.
function gameWinner(a: number | null, b: number | null): 0 | 1 | null {
  if (a === null || b === null) return null;
  if (a > b && ((a >= 21 && a - b >= 2) || a === 30)) return 0;
  if (b > a && ((b >= 21 && b - a >= 2) || b === 30)) return 1;
  return null;
}

// The feed has no match-status field. Two valid game wins establish a best-of-three winner.
export function matchProgress(match: CourtMatch): { winner: 0 | 1 | null; started: boolean } {
  const wins = [0, 0];
  for (let game = 0; game < 3; game++) {
    const winner = gameWinner(match.sides[0].scores[game], match.sides[1].scores[game]);
    if (winner !== null) wins[winner]++;
  }
  return {
    winner: wins[0] >= 2 ? 0 : wins[1] >= 2 ? 1 : null,
    started: match.sides.some((side) => side.scores.some((score) => (score ?? 0) > 0)),
  };
}

export type PointStatus = "game" | "match" | null;

// Derived from the scores, not from the feed's info_match text, which operators set by hand and
// often leave behind after the game ends. In the active (unfinished) game, a side one rally away
// from winning it holds game point: 20 or more and ahead, or 29 (so 29-all gives both sides one).
// It is match point when that side has already won a game.
export function pointStatus(match: CourtMatch): [PointStatus, PointStatus] {
  const none: [PointStatus, PointStatus] = [null, null];
  if (matchProgress(match).winner !== null) return none;
  const game = currentGame(match);
  const scores = match.sides.map((side) => side.scores[game] ?? 0);
  if (gameWinner(scores[0], scores[1]) !== null) return none;
  const wins = [0, 0];
  for (let g = 0; g < game; g++) {
    const winner = gameWinner(match.sides[0].scores[g], match.sides[1].scores[g]);
    if (winner !== null) wins[winner]++;
  }
  return [0, 1].map((side) => {
    const own = scores[side];
    const other = scores[1 - side];
    if (!((own >= 20 && own > other) || own === 29)) return null;
    return wins[side] >= 1 ? "match" : "game";
  }) as [PointStatus, PointStatus];
}

// Game and match point badges come from pointStatus(); a feed message saying the same is dropped.
export function footerMessage(message: string): string {
  return /\b(game|match)\s*point\b/i.test(message) ? "" : message;
}

export function categoryLabel(code: string): string {
  const [discipline, age] = code.split("-");
  const names: Record<string, string> = { MS: "Tunggal putra", WS: "Tunggal putri", MD: "Ganda putra", WD: "Ganda putri", XD: "Ganda campuran" };
  return names[discipline] ? `${names[discipline]}${age ? ` · ${age}` : ""}` : code;
}

// The feed has no "no matches" status either: an idle venue is one where every court is cleared
// down to its number (or the feed has no courts at all).
export function isBoardIdle(matches: CourtMatch[]): boolean {
  return matches.every((match) => !match.available);
}

export function isSourceStale(updatedAt: string | null, now: number): boolean {
  return !updatedAt || now - Date.parse(updatedAt) > 120_000;
}

const EVENT_TITLE = "MilkLife Indonesia Junior International Series 2026";

// Per-venue heading. Keyed by the venue name after the last "-" of the Firebase feed path
// ("bdmntn-jati" -> "jati"), so prefix spellings such as "bdmtn-" still match.
const venues: Record<string, { ageGroups: string[]; location: string | null }> = {
  jati: { ageGroups: ["U17", "U15", "U13"], location: "GOR Djarum, Jati, Kudus, Indonesia" },
  kaliputu: { ageGroups: ["U19"], location: null },
};

export function venueHeading(feedPath: string): { title: string; subtitle: string | null } {
  const segment = feedPath.split("/").filter(Boolean).at(-1) ?? "";
  const venue = venues[segment.slice(segment.lastIndexOf("-") + 1).toLowerCase()];
  if (!venue) return { title: EVENT_TITLE, subtitle: null };
  return { title: `${EVENT_TITLE} (${venue.ageGroups.join(", ")})`, subtitle: venue.location };
}
