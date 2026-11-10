import { getScoreboardQuery } from "@/modules/scores/queries/scores-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getScoreboardQuery();
  return Response.json(result, {
    status: result.ok ? 200 : result.code === "missing" ? 404 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
