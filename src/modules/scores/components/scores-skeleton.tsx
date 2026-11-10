import { cn } from "@/lib/utils";
import { courtGridClass } from "./board-parts";

// `nested` fills the scoreboard section; otherwise it is the page-level Suspense fallback.
export function ScoresSkeleton({ nested = false }: { nested?: boolean }) {
  return <div className={cn(nested ? "mx-auto w-full" : "page-width", "py-5")} role="status" aria-label="Memuat skor">
    <div className="mb-6 h-[35px] w-[220px] animate-pulse rounded-[5px] bg-[#e7ebf2]" />
    <div className={courtGridClass}>{Array.from({ length: 12 }, (_, i) => <div key={i} className="h-[225px] animate-pulse rounded-[10px] border border-[#e0e5ee] bg-white p-4"><div className="mb-[25px] h-5 w-2/5 rounded-[5px] bg-[#eef1f6]" /><div className="mb-[13px] h-[45px] rounded-[5px] bg-[#eef1f6]" /><div className="mb-[13px] h-[45px] rounded-[5px] bg-[#eef1f6]" /></div>)}</div>
    <span className="sr-only">Memuat skor pertandingan…</span>
  </div>;
}
