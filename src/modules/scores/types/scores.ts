export type Score = number | null;
export type PlayerSide = {
  players: string[];
  country: string;
  scores: [Score, Score, Score];
  serving: boolean;
};
export type CourtMatch = {
  id: string;
  court: string;
  category: string;
  group: string;
  message: string;
  sides: [PlayerSide, PlayerSide];
  available: boolean;
};
export type ScoreboardData = {
  matches: CourtMatch[];
  sourceUpdatedAt: string | null;
  fetchedAt: string;
};
export type ScoreboardResult =
  | { ok: true; data: ScoreboardData }
  | { ok: false; code: string; message: string };
