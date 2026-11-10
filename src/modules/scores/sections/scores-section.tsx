import { connection } from "next/server";
import { getScoreboardQuery } from "../queries/scores-query";
import { ScoresBoard } from "../components/scores-board";

export async function ScoresSection() {
  await connection();
  return <ScoresBoard initialResult={await getScoreboardQuery()} />;
}
