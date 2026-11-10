"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { withBasePath } from "@/lib/base-path";
import { isBoardIdle, isSourceStale } from "../lib/scoreboard";
import type { ScoreboardData, ScoreboardResult } from "../types/scores";
import { BoardFooter, BoardShell, BoardToolbar, ConnectionAlert, LoadErrorPanel, StaleNotice, courtGridClass } from "./board-parts";
import { IdleBoard } from "./idle-board";
import { MatchCard } from "./match-card";
import { ScoresSkeleton } from "./scores-skeleton";

async function fetchScores(): Promise<ScoreboardData> {
  let response: Response;
  try {
    response = await fetch(withBasePath("/api/scores"), { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new Error("Koneksi ke server skor terputus atau melewati batas waktu. Aplikasi akan mencoba kembali otomatis.");
  }
  let result: ScoreboardResult;
  try { result = await response.json(); }
  catch { throw new Error("Respons server skor belum dapat dibaca. Aplikasi akan mencoba kembali otomatis."); }
  if (!response.ok || !result.ok) throw new Error(result.ok ? "Skor belum dapat dimuat." : result.message);
  return result.data;
}

export function ScoresBoard({ initialResult, feedPath }: { initialResult: ScoreboardResult; feedPath: string }) {
  const [offline, setOffline] = useState(false);
  const [now, setNow] = useState(initialResult.ok ? Date.parse(initialResult.data.fetchedAt) : 0);
  const query = useQuery({
    queryKey: ["scoreboard"], queryFn: fetchScores,
    initialData: initialResult.ok ? initialResult.data : undefined,
    initialDataUpdatedAt: initialResult.ok ? Date.parse(initialResult.data.fetchedAt) : undefined,
    staleTime: 1_000, refetchInterval: 2_000, refetchIntervalInBackground: false,
  });

  useEffect(() => {
    const updateNetwork = () => setOffline(!navigator.onLine);
    updateNetwork();
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    return () => { clearInterval(timer); window.removeEventListener("online", updateNetwork); window.removeEventListener("offline", updateNetwork); };
  }, []);

  const data = query.data;
  const errorMessage = query.error?.message || (!data && !initialResult.ok ? initialResult.message : null);
  const matches = data?.matches ?? [];
  const stale = data ? isSourceStale(data.sourceUpdatedAt, now) : false;

  return <BoardShell feedPath={feedPath}>
    <BoardToolbar courts={matches.length} offline={offline} troubled={query.isError} connected={Boolean(data)} refreshing={query.isFetching} refreshDisabled={query.isFetching} refreshLabel="Perbarui skor" onRefresh={() => void query.refetch()} />
    {(errorMessage || offline) && <ConnectionAlert offline={offline} message={errorMessage} hasData={Boolean(data)} retryDisabled={query.isFetching || offline} onRetry={() => void query.refetch()} />}
    {stale && data && !errorMessage && !offline && <StaleNotice sourceUpdatedAt={data.sourceUpdatedAt} />}
    {!data && !offline && (query.isPending || query.isFetching) ? <ScoresSkeleton nested />
      : !data ? <LoadErrorPanel offline={offline} message={query.error?.message || (!initialResult.ok ? initialResult.message : "Mencoba menghubungkan ke sumber skor.")} onRetry={() => void query.refetch()} />
        : isBoardIdle(matches) ? <IdleBoard courts={matches.length} />
          : <div className={courtGridClass}>{matches.map((m) => <MatchCard match={m} key={m.id} animateIndicator={!stale && !offline && !query.isError} />)}</div>}
    <BoardFooter refreshLabel="Pembaruan otomatis · 2 detik" />
  </BoardShell>;
}
