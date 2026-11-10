import "server-only";
import { DataSourceError } from "@/lib/server/http-client";
import { createCachedLoader } from "@/lib/server/ttl-cache";
import { fetchFirebaseScores } from "../api/firebase-api";
import { mapCourtMatch, mapSourceTimestamp } from "../mappers/scores-mapper";
import type { ScoreboardData } from "../types/scores";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Every open browser polls every 2s. A short shared cache caps Firebase reads at roughly one per
// SCOREBOARD_CACHE_MS per server instance, regardless of how many viewers are watching.
const SCOREBOARD_CACHE_MS = 1_500;

export const getScoreboardData = createCachedLoader(loadScoreboardData, SCOREBOARD_CACHE_MS);

async function loadScoreboardData(): Promise<ScoreboardData> {
  const raw = await fetchFirebaseScores();
  if (raw === null) throw new DataSourceError("missing");
  if (!isRecord(raw) || !("match" in raw)) throw new DataSourceError("invalid");
  const list = raw.match;
  if (list !== null && !Array.isArray(list) && !isRecord(list)) throw new DataSourceError("invalid");
  const records: unknown[] = list === null ? [] : Object.values(list);
  const matches = records.filter((r) => r !== null).map((r) => {
    if (!isRecord(r)) throw new DataSourceError("invalid");
    const match = mapCourtMatch(r);
    if (!match) throw new DataSourceError("invalid");
    return match;
  });
  if (new Set(matches.map((m) => m.id)).size !== matches.length) throw new DataSourceError("invalid");
  return { matches: matches.sort((a, b) => Number(a.court) - Number(b.court)), sourceUpdatedAt: mapSourceTimestamp(raw.updatedAt), fetchedAt: new Date().toISOString() };
}
