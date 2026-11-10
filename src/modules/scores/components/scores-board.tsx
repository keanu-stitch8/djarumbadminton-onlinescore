"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Clock3, RefreshCw, Signal, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { isSourceStale } from "../lib/scoreboard";
import type { ScoreboardData, ScoreboardResult } from "../types/scores";
import { MatchCard } from "./match-card";
import { ScoresSkeleton } from "./scores-skeleton";
import { ScoreboardTitle } from "./scoreboard-title";

async function fetchScores(): Promise<ScoreboardData> {
  let response: Response;
  try {
    response = await fetch("/api/scores", { cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new Error("Koneksi ke server skor terputus atau melewati batas waktu. Aplikasi akan mencoba kembali otomatis.");
  }
  let result: ScoreboardResult;
  try { result = await response.json(); }
  catch { throw new Error("Respons server skor belum dapat dibaca. Aplikasi akan mencoba kembali otomatis."); }
  if (!response.ok || !result.ok) throw new Error(result.ok ? "Skor belum dapat dimuat." : result.message);
  return result.data;
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
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


  return <div className="page-width scoreboard-content display-content">
    <ScoreboardTitle feedPath={feedPath} />

    <section className="scoreboard-panel" aria-label="Skor seluruh lapangan">
      <div className="scoreboard-toolbar"><div className="toolbar-title"><span className="section-marker" /><h2>SKOR LAPANGAN</h2><span className="court-count">{matches.length}</span></div><div className="connection-group"><span className={cn("connection-status", (query.isError || offline) && "connection-error")} role="status">{offline ? <WifiOff size={13} /> : query.isError ? <AlertCircle size={13} /> : <Signal size={13} />}<span>{offline ? "Offline" : query.isError ? "Menghubungkan ulang" : data ? "Terhubung" : "Menghubungkan"}</span></span><Button variant="ghost" size="icon" className="refresh-button" onClick={() => void query.refetch()} disabled={query.isFetching} aria-label="Perbarui skor"><RefreshCw className={cn(query.isFetching && "animate-spin")} /></Button></div></div>


      {(errorMessage || offline) && <Alert><AlertCircle aria-hidden="true" /><div className="min-w-0 flex-1"><h3 className="font-semibold">{offline ? "Koneksi internet terputus" : "Gangguan pembaruan skor Firebase"}</h3><p className="mt-1 text-xs leading-relaxed">{offline ? "Perangkat sedang offline. Pembaruan akan dilanjutkan setelah internet tersambung." : errorMessage}{data && " Skor terakhir tetap ditampilkan."}</p></div><Button variant="outline" size="sm" className="shrink-0 border-red-200 text-red-800" onClick={() => void query.refetch()} disabled={query.isFetching || offline} aria-label="Coba sambungkan kembali skor"><RefreshCw /><span className="hidden sm:inline">Coba lagi</span></Button></Alert>}
      {stale && data && !errorMessage && !offline && <div className="source-notice" role="status"><Clock3 size={15} /><span>Sumber belum mengirim pembaruan terbaru.{data.sourceUpdatedAt && <> Data sumber: <strong>{dateTime(data.sourceUpdatedAt)} WIB</strong>.</>}</span></div>}

      {!data && !offline && (query.isPending || query.isFetching) ? <ScoresSkeleton /> : !data ? <div className="state-panel" role="alert"><div className="state-icon"><WifiOff size={27} /></div><h3>{offline ? "Anda sedang offline" : "Skor belum dapat dimuat"}</h3><p>{offline ? "Hubungkan perangkat ke internet. Skor akan dimuat kembali secara otomatis." : query.error?.message || (!initialResult.ok ? initialResult.message : "Mencoba menghubungkan ke sumber skor.")}</p><Button onClick={() => void query.refetch()} variant="outline"><RefreshCw />Coba lagi</Button></div>
        : matches.length === 0 ? <div className="state-panel"><h3>Belum ada pertandingan</h3><p>Skor akan muncul saat data pertandingan tersedia.</p></div>
          : <div className="display-grid">{matches.map((m) => <MatchCard match={m} key={m.id} animateIndicator={!stale && !offline && !query.isError} />)}</div>}

      <div className="board-bottom"><div className="score-legend"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span>Indikator pemain</span><span className="legend-divider">·</span><span>G1–G3: gim</span></div><span className="auto-refresh-label">Pembaruan otomatis · 2 detik</span></div>
    </section>

  </div>;
}
