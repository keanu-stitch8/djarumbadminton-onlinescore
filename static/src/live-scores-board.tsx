import { useEffect, useState } from "react";
import { AlertCircle, Clock3, RefreshCw, Signal, WifiOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IdleBoard } from "@/modules/scores/components/idle-board";
import { MatchCard } from "@/modules/scores/components/match-card";
import { ScoreboardTitle } from "@/modules/scores/components/scoreboard-title";
import { ScoresSkeleton } from "@/modules/scores/components/scores-skeleton";
import { isBoardIdle, isSourceStale } from "@/modules/scores/lib/scoreboard";
import { feedPath, streamUrl } from "./config";
import { useFirebaseScores } from "./use-firebase-scores";

// Short blips (Firebase recycles streams) only change the status chip; the alert waits this long.
const ALERT_AFTER_MS = 8_000;

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function LiveScoresBoard() {
  const { data, status, troubleSince, error, reconnect } = useFirebaseScores(streamUrl);
  const [offline, setOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const updateNetwork = () => setOffline(!navigator.onLine);
    const timer = window.setInterval(() => setNow(Date.now()), 2_000);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);
    return () => { window.clearInterval(timer); window.removeEventListener("online", updateNetwork); window.removeEventListener("offline", updateNetwork); };
  }, []);

  const matches = data?.matches ?? [];
  const stale = data ? isSourceStale(data.sourceUpdatedAt, now) : false;
  const troubled = status === "reconnecting";
  const longTrouble = troubled && troubleSince !== null && now - troubleSince > ALERT_AFTER_MS;
  const errorMessage = error ?? (longTrouble ? "Koneksi ke Firebase terputus. Aplikasi sedang mencoba tersambung kembali." : null);
  const busy = status !== "live";

  return <div className="page-width scoreboard-content display-content">
    <ScoreboardTitle feedPath={feedPath} />

    <section className="scoreboard-panel" aria-label="Skor seluruh lapangan">
      <div className="scoreboard-toolbar"><div className="toolbar-title"><span className="section-marker" /><h2>SKOR LAPANGAN</h2><span className="court-count">{matches.length}</span></div><div className="connection-group"><span className={cn("connection-status", (troubled || offline) && "connection-error")} role="status">{offline ? <WifiOff size={13} /> : troubled ? <AlertCircle size={13} /> : <Signal size={13} />}<span>{offline ? "Offline" : troubled ? "Menghubungkan ulang" : data ? "Terhubung" : "Menghubungkan"}</span></span><Button variant="ghost" size="icon" className="refresh-button" onClick={reconnect} disabled={busy && !troubled} aria-label="Sambungkan ulang skor"><RefreshCw className={cn(busy && "animate-spin")} /></Button></div></div>

      {(errorMessage || offline) && <Alert><AlertCircle aria-hidden="true" /><div className="min-w-0 flex-1"><h3 className="font-semibold">{offline ? "Koneksi internet terputus" : "Gangguan pembaruan skor Firebase"}</h3><p className="mt-1 text-xs leading-relaxed">{offline ? "Perangkat sedang offline. Pembaruan akan dilanjutkan setelah internet tersambung." : errorMessage}{data && " Skor terakhir tetap ditampilkan."}</p></div><Button variant="outline" size="sm" className="shrink-0 border-red-200 text-red-800" onClick={reconnect} disabled={offline} aria-label="Coba sambungkan kembali skor"><RefreshCw /><span className="hidden sm:inline">Coba lagi</span></Button></Alert>}
      {stale && data && !errorMessage && !offline && <div className="source-notice" role="status"><Clock3 size={15} /><span>Sumber belum mengirim pembaruan terbaru.{data.sourceUpdatedAt && <> Data sumber: <strong>{dateTime(data.sourceUpdatedAt)} WIB</strong>.</>}</span></div>}

      {!data && !error && !offline ? <ScoresSkeleton />
        : !data ? <div className="state-panel" role="alert"><div className="state-icon"><WifiOff size={27} /></div><h3>{offline ? "Anda sedang offline" : "Skor belum dapat dimuat"}</h3><p>{offline ? "Hubungkan perangkat ke internet. Skor akan dimuat kembali secara otomatis." : error}</p><Button onClick={reconnect} variant="outline"><RefreshCw />Coba lagi</Button></div>
          : isBoardIdle(matches) ? <IdleBoard courts={matches.length} />
            : <div className="display-grid">{matches.map((m) => <MatchCard match={m} key={m.id} animateIndicator={!stale && !offline && !troubled} />)}</div>}

      <div className="board-bottom"><div className="score-legend"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span>Indikator pemain</span><span className="legend-divider">·</span><span>G1–G3: pertandingan</span></div><span className="auto-refresh-label">Pembaruan real-time</span></div>
    </section>
  </div>;
}
