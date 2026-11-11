import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";
import { categoryLabel, countryFlag, currentGame, matchProgress } from "../lib/scoreboard";
import type { CourtMatch } from "../types/scores";

// Player column plus three game columns, shared by the heading row and both player rows.
const scoreColumns = "grid grid-cols-[minmax(0,1fr)_repeat(3,39px)] gap-1 sm:grid-cols-[minmax(0,1fr)_repeat(3,35px)] lg:grid-cols-[minmax(0,1fr)_repeat(3,88px)] lg:gap-[7px]";
// Horizontal padding of the header, score table and footer below 1024px (lg).
const cardInset = "px-3.5 sm:px-[13px]";
// Badge sets text-xs; keep its line height when overriding the size.
const badgeText = "leading-[calc(1/0.75)]";

// Phones and tablets: court header on top. From 1024px (lg): the court number sits in a column on the left.
export function MatchCard({ match, animateIndicator = true }: { match: CourtMatch; animateIndicator?: boolean }) {
  const activeGame = currentGame(match);
  const progress = matchProgress(match);
  return <article className={cn("min-w-0 overflow-hidden rounded-[10px] border border-[#e0e5ee] bg-white shadow-[0_2px_3px_#192c5010] lg:relative lg:rounded-[9px] lg:pl-[92px]", !match.available && "border-dashed bg-[#fafbfe] shadow-none")} aria-label={`Lapangan ${match.court}${match.category ? `, ${categoryLabel(match.category)}` : ""}`}>
    <div className={cn("flex h-[45px] items-center justify-between gap-2.5 border-b border-[#edf0f5] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[90px] lg:flex-col lg:justify-center lg:gap-[7px] lg:border-0 lg:bg-[#e9edf5] lg:p-1.5", cardInset)}>
      <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1px] text-[#7d879d] lg:flex-col lg:gap-[3px] lg:text-[8px]"><MapPin size={13} aria-hidden="true" className="text-[#9ba5b8] lg:hidden" /><span>LAPANGAN</span><strong className="ml-px font-display text-[18px] tracking-normal text-[#203971] lg:text-[34px]">{match.court.padStart(2, "0")}</strong></div>
      <div className="flex items-center gap-2">{match.category && <Badge className={cn("bg-[#f0f3fa] px-1.5 py-[3px] text-[9px] text-[#5a6d97] lg:bg-transparent lg:text-[8px]", badgeText)}>{match.category}</Badge>}</div>
    </div>
    <div className={cn(cardInset, "lg:px-3 lg:py-1.5")} role="table" aria-label={`Skor lapangan ${match.court}`}>
      <div className={cn(scoreColumns, "h-[29px] items-center text-[8px] font-semibold tracking-[0.6px] text-[#929aab] lg:h-[19px] lg:text-[9px]")} role="row"><span role="columnheader" className="lg:text-[8px]">{match.group || (match.available ? "PEMAIN" : "MENUNGGU PERTANDINGAN")}</span>{[1, 2, 3].map((game) => <span key={game} role="columnheader" className={cn("text-center", game - 1 === activeGame && match.available && "text-[#2b4d9b]")}>G{game}</span>)}</div>
      {match.sides.map((side, index) => {
        const flag = countryFlag(side.country);
        const winner = progress.winner === index;
        const ongoing = progress.winner === null && progress.started;
        const showIndicator = match.available && (winner || (progress.winner === null && side.serving));
        const indicatorLabel = winner ? "Pemenang pertandingan" : "Pemegang servis";
        const flagClass = "block aspect-[4/3] h-[21px] w-7 rounded-none border border-gray-200 object-fill lg:h-6 lg:w-8";
        return <div className={cn(scoreColumns, "min-h-[55px] items-stretch pb-[7px] lg:min-h-[47px] lg:pb-1")} role="row" key={index}>
          <div className="flex min-w-0 items-center gap-[7px] pr-0.5 sm:gap-[5px] lg:gap-2.5" role="cell">
            {/* Flag only; a country without a flag image shows its code inside the placeholder. */}
            <div className="flex shrink-0 items-center">{flag.flag ? <Image src={withBasePath(flag.flag)} alt={flag.name} width={32} height={24} className={flagClass} unoptimized /> : <span className={cn(flagClass, "grid place-items-center bg-[#e9edf3] text-[8px] leading-none font-[650] text-[#8993a7] lg:text-[9px]")} aria-hidden={!side.country}>{side.country}</span>}</div>
            {/* From 1024px (lg) a doubles pair shares one line: "NAME / PARTNER". */}
            <div className="min-w-0 font-display text-[14px] leading-[1.35] font-semibold tracking-[0.25px] wrap-anywhere text-[#293449] sm:text-[13px] lg:flex lg:text-[22px] lg:tracking-[0.3px]">{side.players.length ? side.players.map((p, i) => <span key={i} className={cn("block", i > 0 && "lg:before:mx-2 lg:before:text-[#b6becd] lg:before:content-['/']")}>{p}</span>) : <span className="block text-[10px] font-normal text-[#a1a9b7]">{match.available ? "Menunggu pemain" : "Belum ada pertandingan"}</span>}</div>
            {showIndicator && <span className={cn("ml-auto inline-flex size-4 shrink-0 items-center justify-center", ongoing && animateIndicator && "animate-pulse motion-reduce:animate-none")} role="img" aria-label={indicatorLabel} title={indicatorLabel}><span className={cn("size-2.5 rounded-full", winner || ongoing ? "bg-emerald-500" : "bg-slate-400")} /></span>}
          </div>
          {side.scores.map((score, game) => <div key={game} role="cell" aria-label={`Pertandingan ${game + 1}: ${match.available && score !== null ? score : "belum ada skor"}`} className={cn("grid place-items-center rounded-[5px] bg-[#f4f6fa] font-display text-[24px] leading-none font-bold text-[#a6aebc] tabular-nums sm:text-[26px] lg:text-[34px]", game === activeGame && match.available && "bg-[#eaf0fc] text-[#23428d] shadow-[inset_0_-2px_0_#dae4fc]", !match.available && "bg-[#f0f2f6] text-[#c3c9d3]")}>{match.available && score !== null ? score : "—"}</div>)}
        </div>;
      })}
    </div>
    <div className={cn("mt-1 flex min-h-[35px] items-center justify-between gap-2 border-t border-[#f0f2f6] py-[7px] text-[9px] text-[#8a93a4] lg:mt-0 lg:min-h-6 lg:px-[18px] lg:py-[3px] lg:text-[8px]", cardInset)}><span>{match.available ? categoryLabel(match.category) || "Pertandingan" : "Lapangan tersedia"}</span>{match.message ? <Badge className={cn("bg-[#fff4df] px-1.5 py-0.5 text-[8px] text-[#af7628] lg:text-[9px]", badgeText)}>{match.message}</Badge> : <span className="text-[9px] text-[#7789aa] lg:text-[10px]">{match.available ? `Pertandingan ${activeGame + 1}` : "Menunggu"}</span>}</div>
  </article>;
}
