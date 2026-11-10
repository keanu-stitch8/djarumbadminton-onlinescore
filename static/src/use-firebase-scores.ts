import { useCallback, useEffect, useRef, useState } from "react";
import { mapScoreboard } from "@/modules/scores/mappers/scores-mapper";
import type { ScoreboardData } from "@/modules/scores/types/scores";
import { applyStreamEvent, type StreamPayload } from "./firebase-stream";

export type StreamStatus = "connecting" | "live" | "reconnecting";
export type FirebaseScores = {
  data: ScoreboardData | null;
  status: StreamStatus;
  /** When the current connection problem started (ms), or null while live. */
  troubleSince: number | null;
  error: string | null;
  reconnect: () => void;
};

const messages = {
  missing: "Sumber skor belum ditemukan.",
  invalid: "Format data skor belum dapat dibaca.",
} as const;

// Firebase sends a keep-alive roughly every 30s; a silent connection after this is treated as dead.
const SILENCE_LIMIT_MS = 90_000;

/**
 * Live scores straight from the Firebase Realtime Database REST streaming API (Server-Sent Events).
 * Firebase pushes the full tree once on connect, then only the changes. No polling, no server.
 * The stream is closed while the tab is hidden and reopened (with a fresh snapshot) when visible.
 */
export function useFirebaseScores(streamUrl: string): FirebaseScores {
  const [state, setState] = useState<Omit<FirebaseScores, "reconnect">>({ data: null, status: "connecting", troubleSince: null, error: null });
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    let tree: unknown;
    let source: EventSource | null = null;
    let retryTimer: number | undefined;
    let attempt = 0;
    let lastEventAt = Date.now();

    const trouble = (status: StreamStatus) => setState((s) => ({ ...s, status, troubleSince: s.troubleSince ?? Date.now() }));

    const onStreamEvent = (type: "put" | "patch") => (event: MessageEvent<string>) => {
      lastEventAt = Date.now();
      try {
        tree = applyStreamEvent(tree, type, JSON.parse(event.data) as StreamPayload);
      } catch {
        setState((s) => ({ ...s, error: messages.invalid }));
        return;
      }
      attempt = 0;
      const result = mapScoreboard(tree);
      if (result.ok) setState({ data: { ...result.data, fetchedAt: new Date().toISOString() }, status: "live", troubleSince: null, error: null });
      else setState((s) => ({ ...s, status: "live", troubleSince: null, error: messages[result.code] }));
    };

    const close = () => {
      source?.close();
      source = null;
      window.clearTimeout(retryTimer);
    };

    const scheduleReconnect = () => {
      close();
      trouble("reconnecting");
      retryTimer = window.setTimeout(connect, Math.min(30_000, 2_000 * 2 ** attempt++));
    };

    function connect() {
      close();
      lastEventAt = Date.now();
      const es = new EventSource(streamUrl);
      source = es;
      es.addEventListener("put", onStreamEvent("put"));
      es.addEventListener("patch", onStreamEvent("patch"));
      es.addEventListener("keep-alive", () => { lastEventAt = Date.now(); });
      // Firebase ends the stream on rule changes or revoked access; reconnect with backoff.
      es.addEventListener("cancel", scheduleReconnect);
      es.addEventListener("auth_revoked", scheduleReconnect);
      es.onerror = () => {
        // CONNECTING: the browser retries by itself. CLOSED: it gave up (e.g. HTTP error), so we retry.
        if (es.readyState === EventSource.CLOSED) scheduleReconnect();
        else trouble("reconnecting");
      };
    }
    connectRef.current = () => { attempt = 0; connect(); };

    const watchdog = window.setInterval(() => {
      if (source && !document.hidden && Date.now() - lastEventAt > SILENCE_LIMIT_MS) scheduleReconnect();
    }, 15_000);
    const onVisibility = () => {
      if (document.hidden) close();
      else if (!source) connectRef.current();
    };
    const onOnline = () => connectRef.current();

    connect();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    return () => {
      close();
      window.clearInterval(watchdog);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
  }, [streamUrl]);

  const reconnect = useCallback(() => connectRef.current(), []);
  return { ...state, reconnect };
}
