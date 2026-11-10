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

const countries: Record<string, [string, string]> = {
  INA: ["ID", "Indonesia"], IDN: ["ID", "Indonesia"], TPE: ["TW", "Chinese Taipei"],
  CHN: ["CN", "China"], MAS: ["MY", "Malaysia"], THA: ["TH", "Thailand"],
  JPN: ["JP", "Jepang"], KOR: ["KR", "Korea Selatan"], IND: ["IN", "India"],
  SGP: ["SG", "Singapura"], VIE: ["VN", "Vietnam"], HKG: ["HK", "Hong Kong"],
  AUS: ["AU", "Australia"], ENG: ["GB", "Inggris"], DEN: ["DK", "Denmark"],
  PHI: ["PH", "Filipina"], USA: ["US", "Amerika Serikat"], CAN: ["CA", "Kanada"],
};

export function countryFlag(code: string): { flag: string; name: string } {
  const country = countries[code.toUpperCase()];
  if (!country) return { flag: "", name: code };
  const iso = country[0].toLowerCase();
  return { flag: iso === "id" ? "/flags/id.svg" : `https://flagcdn.com/${iso}.svg`, name: country[1] };
}

// The feed has no match-status field. Two valid game wins establish a best-of-three winner.
export function matchProgress(match: CourtMatch): { winner: 0 | 1 | null; started: boolean } {
  const wins = [0, 0];
  for (let game = 0; game < 3; game++) {
    const a = match.sides[0].scores[game];
    const b = match.sides[1].scores[game];
    if (a === null || b === null) continue;
    if (a > b && ((a >= 21 && a - b >= 2) || a === 30)) wins[0]++;
    if (b > a && ((b >= 21 && b - a >= 2) || b === 30)) wins[1]++;
  }
  return {
    winner: wins[0] >= 2 ? 0 : wins[1] >= 2 ? 1 : null,
    started: match.sides.some((side) => side.scores.some((score) => (score ?? 0) > 0)),
  };
}

export function categoryLabel(code: string): string {
  const [discipline, age] = code.split("-");
  const names: Record<string, string> = { MS: "Tunggal putra", WS: "Tunggal putri", MD: "Ganda putra", WD: "Ganda putri", XD: "Ganda campuran" };
  return names[discipline] ? `${names[discipline]}${age ? ` · ${age}` : ""}` : code;
}

export function isSourceStale(updatedAt: string | null, now: number): boolean {
  return !updatedAt || now - Date.parse(updatedAt) > 120_000;
}
