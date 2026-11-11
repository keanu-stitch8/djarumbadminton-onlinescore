import type { ReactNode } from "react";
import { AlertCircle, Clock3, RefreshCw, Signal, WifiOff } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatePanel } from "@/components/state-panel";
import { cn } from "@/lib/utils";
import { ScoreboardTitle } from "./scoreboard-title";

// Building blocks of the scores board. ScoresBoard owns the data source and decides which of these
// to render.

// One column on phones, two from 640px, one wide court per row from 1024px (lg).
export const courtGridClass = "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-[18px] lg:grid-cols-1 lg:gap-3.5";

export function BoardShell({ feedPath, children }: { feedPath: string; children: ReactNode }) {
  return <div className="page-width pt-[18px] pb-[22px] sm:pt-[33px] lg:pt-5 lg:pb-[18px]">
    <ScoreboardTitle feedPath={feedPath} />
    <section aria-label="Skor seluruh lapangan">{children}</section>
  </div>;
}

type ToolbarProps = {
  courts: number;
  offline: boolean;
  troubled: boolean;
  connected: boolean;
  refreshing: boolean;
  refreshDisabled: boolean;
  refreshLabel: string;
  onRefresh: () => void;
};

export function BoardToolbar({ courts, offline, troubled, connected, refreshing, refreshDisabled, refreshLabel, onRefresh }: ToolbarProps) {
  return <div className="mb-[13px] flex items-center justify-between gap-2.5">
    <div className="flex items-center gap-[7px]"><span className="h-3 w-[3px] rounded-[1px] bg-[#ed862b]" /><h2 className="text-[10px] font-[750] tracking-[1px] sm:text-[11px]">SKOR LAPANGAN</h2><span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-[5px] border border-[#dfe4ee] bg-white text-[10px] font-semibold text-[#69758a]">{courts}</span></div>
    <div className="flex items-center gap-1.5">
      <span className={cn("flex items-center gap-[5px] text-[10px] font-semibold text-[#337a60] sm:text-[11px]", (troubled || offline) && "text-[#97682c]")} role="status">{offline ? <WifiOff size={13} /> : troubled ? <AlertCircle size={13} /> : <Signal size={13} />}<span>{offline ? "Offline" : troubled ? "Menghubungkan ulang" : connected ? "Terhubung" : "Menghubungkan"}</span></span>
      <Button variant="ghost" size="icon" className="size-[30px] border border-[#e0e5ed] bg-white text-[#758098] hover:bg-white hover:text-[#758098] [&_svg]:size-3" onClick={onRefresh} disabled={refreshDisabled} aria-label={refreshLabel}><RefreshCw className={cn(refreshing && "animate-spin")} /></Button>
    </div>
  </div>;
}

export function ConnectionAlert({ offline, message, hasData, retryDisabled, onRetry }: { offline: boolean; message: string | null; hasData: boolean; retryDisabled: boolean; onRetry: () => void }) {
  return <Alert><AlertCircle aria-hidden="true" /><div className="min-w-0 flex-1"><h3 className="font-semibold">{offline ? "Koneksi internet terputus" : "Gangguan pembaruan skor Firebase"}</h3><p className="mt-1 text-xs leading-relaxed">{offline ? "Perangkat sedang offline. Pembaruan akan dilanjutkan setelah internet tersambung." : message}{hasData && " Skor terakhir tetap ditampilkan."}</p></div><Button variant="outline" size="sm" className="shrink-0 border-red-200 text-red-800" onClick={onRetry} disabled={retryDisabled} aria-label="Coba sambungkan kembali skor"><RefreshCw /><span className="hidden sm:inline">Coba lagi</span></Button></Alert>;
}

function dateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

export function StaleNotice({ sourceUpdatedAt }: { sourceUpdatedAt: string | null }) {
  return <div className="mb-4 flex items-start gap-2 rounded-[7px] border border-[#eee2ca] bg-[#fffaf1] px-3 py-2.5 text-[11px] leading-[1.65] text-[#8b6e3c]" role="status"><Clock3 size={15} className="mt-0.5 shrink-0" /><span>Sumber belum mengirim pembaruan terbaru.{sourceUpdatedAt && <> Data sumber: <strong className="font-semibold">{dateTime(sourceUpdatedAt)} WIB</strong>.</>}</span></div>;
}

export function LoadErrorPanel({ offline, message, onRetry }: { offline: boolean; message: ReactNode; onRetry: () => void }) {
  return <StatePanel role="alert" icon={<WifiOff size={27} />} title={offline ? "Anda sedang offline" : "Skor belum dapat dimuat"} action={<Button className="mt-[7px]" onClick={onRetry} variant="outline"><RefreshCw />Coba lagi</Button>}>{offline ? "Hubungkan perangkat ke internet. Skor akan dimuat kembali secara otomatis." : message}</StatePanel>;
}

export function BoardFooter({ refreshLabel }: { refreshLabel: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[#8a93a6]">
    <div className="flex items-center gap-[5px] text-[9px] lg:text-[10px]"><span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /><span>Indikator pemain</span><span className="mx-[3px] text-[#b4bdca]">·</span><span>G1–G3: pertandingan</span></div>
    <span className="text-[9px] lg:text-[10px]">{refreshLabel}</span>
  </div>;
}
