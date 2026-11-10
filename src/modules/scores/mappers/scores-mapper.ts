import type { CourtMatch, PlayerSide, Score } from "../types/scores.ts";

export function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function score(value: unknown): Score {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 30 ? n : null;
}

function mapSide(raw: Record<string, unknown>, side: 1 | 2): PlayerSide {
  const p = `team${side}`;
  const players = [cleanText(raw[`${p}_fullname_p1`]), cleanText(raw[`${p}_fullname_p2`])].filter(Boolean);
  if (!players.length && cleanText(raw[`${p}_fullname`])) players.push(cleanText(raw[`${p}_fullname`]));
  return {
    players,
    country: cleanText(raw[`${p}_club1`]) || cleanText(raw[`${p}_nameclub`]),
    scores: [score(raw[`${p}set1`]), score(raw[`${p}set2`]), score(raw[`${p}set3`])],
    // Upstream uses a nonempty image URL as the serving flag. Never request that LAN image.
    serving: Boolean(cleanText(raw[`${p}_service`]) || cleanText(raw[`${p}_service_small`])),
  };
}

export function mapCourtMatch(raw: Record<string, unknown>): CourtMatch | null {
  const court = typeof raw.court === "number" && Number.isInteger(raw.court) && raw.court > 0
    ? String(raw.court) : cleanText(raw.court);
  if (!/^\d{1,3}$/.test(court) || Number(court) < 1) return null;
  const sides: [PlayerSide, PlayerSide] = [mapSide(raw, 1), mapSide(raw, 2)];
  return {
    id: `court-${Number(court)}`,
    court: String(Number(court)),
    category: cleanText(raw.kelompok_pertandingan) || cleanText(raw.category),
    group: cleanText(raw.group_name),
    message: cleanText(raw.info_match),
    sides,
    available: sides.some((s) => s.players.length > 0),
  };
}

export function mapSourceTimestamp(value: unknown): string | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const numeric = Number(value);
  const date = Number.isFinite(numeric)
    ? new Date(numeric < 1e12 ? numeric * 1000 : numeric) : new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
