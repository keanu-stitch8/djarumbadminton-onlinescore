import "server-only";
import { DataSourceError } from "@/lib/server/http-client";
import { createCachedLoader } from "@/lib/server/ttl-cache";
import { fetchFirebaseScores } from "../api/firebase-api";
import { mapScoreboard } from "../mappers/scores-mapper";
import type { ScoreboardData } from "../types/scores";

// Every open browser polls every 2s. A short shared cache caps Firebase reads at roughly one per
// SCOREBOARD_CACHE_MS per server instance, regardless of how many viewers are watching.
const SCOREBOARD_CACHE_MS = 1_500;

export const getScoreboardData = createCachedLoader(loadScoreboardData, SCOREBOARD_CACHE_MS);

async function loadScoreboardData(): Promise<ScoreboardData> {
  const result = mapScoreboard(await fetchFirebaseScores());
  if (!result.ok) throw new DataSourceError(result.code);
  return { ...result.data, fetchedAt: new Date().toISOString() };
}
