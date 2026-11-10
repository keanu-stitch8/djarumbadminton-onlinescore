import { useEffect, useState } from "react";
import { BoardFooter, BoardShell, BoardToolbar, ConnectionAlert, LoadErrorPanel, StaleNotice, courtGridClass } from "@/modules/scores/components/board-parts";
import { IdleBoard } from "@/modules/scores/components/idle-board";
import { MatchCard } from "@/modules/scores/components/match-card";
import { ScoresSkeleton } from "@/modules/scores/components/scores-skeleton";
import { isBoardIdle, isSourceStale } from "@/modules/scores/lib/scoreboard";
import { feedPath, streamUrl } from "./config";
import { useFirebaseScores } from "./use-firebase-scores";

// Short blips (Firebase recycles streams) only change the status chip; the alert waits this long.
const ALERT_AFTER_MS = 8_000;

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

  return <BoardShell feedPath={feedPath}>
    <BoardToolbar courts={matches.length} offline={offline} troubled={troubled} connected={Boolean(data)} refreshing={busy} refreshDisabled={busy && !troubled} refreshLabel="Sambungkan ulang skor" onRefresh={reconnect} />
    {(errorMessage || offline) && <ConnectionAlert offline={offline} message={errorMessage} hasData={Boolean(data)} retryDisabled={offline} onRetry={reconnect} />}
    {stale && data && !errorMessage && !offline && <StaleNotice sourceUpdatedAt={data.sourceUpdatedAt} />}
    {!data && !error && !offline ? <ScoresSkeleton nested />
      : !data ? <LoadErrorPanel offline={offline} message={error} onRetry={reconnect} />
        : isBoardIdle(matches) ? <IdleBoard courts={matches.length} />
          : <div className={courtGridClass}>{matches.map((m) => <MatchCard match={m} key={m.id} animateIndicator={!stale && !offline && !troubled} />)}</div>}
    <BoardFooter refreshLabel="Pembaruan real-time" />
  </BoardShell>;
}
