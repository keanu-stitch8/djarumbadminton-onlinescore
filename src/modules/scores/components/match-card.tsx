import Image from "next/image";
import { Hourglass, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { withBasePath } from "@/lib/base-path";
import { RollScore } from "./roll-score";
import { categoryLabel, countryFlag, currentGame, footerMessage, matchProgress, pointStatus } from "../lib/scoreboard";
import type { CourtMatch } from "../types/scores";

// Player column plus three game columns, shared by the heading row and both player rows.
const scoreColumns = "grid grid-cols-[minmax(0,1fr)_repeat(3,39px)] gap-1 sm:grid-cols-[minmax(0,1fr)_repeat(3,35px)] lg:grid-cols-[minmax(0,1fr)_repeat(3,88px)] lg:gap-1.75";
// Horizontal padding of the header, score table and footer below 1024px (lg).
const cardInset = "px-3.5 sm:px-3.25";
// Badge sets text-xs; keep its line height when overriding the size.
const badgeText = "leading-[calc(1/0.75)]";
// Game point in amber, match point in red; shown on the row of the side that holds it.
const pointBadge = { game: ["GAME POINT", "bg-[#fff1d6] text-[#a8661a]"], match: ["MATCH POINT", "bg-[#ffe5e2] text-[#c2392b]"] } as const;

// Phones and tablets: court header on top. From 1024px (lg): the court number sits in a column on the left.
// The fullscreen layout (two columns, six rows on 1080p) uses a shorter card: 124px instead of 151px.
// A waiting court (cleared down to its number) shows one text block instead of an empty score table.
export function MatchCard({ match, animateIndicator = true }: { match: CourtMatch; animateIndicator?: boolean }) {
  const header = <div className={cn("flex h-11.25 items-center justify-between gap-2.5 border-b border-[#edf0f5] lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-22.5 lg:flex-col lg:justify-center lg:gap-1.75 lg:border-0 lg:bg-[#e9edf5] lg:p-1.5", cardInset)}>
    <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[1px] text-[#7d879d] lg:flex-col lg:gap-0.75 lg:text-[8px]"><MapPin size={13} aria-hidden="true" className="text-[#9ba5b8] lg:hidden" /><span>LAPANGAN</span><strong className="ml-px font-display text-[18px] tracking-normal text-[#203971] lg:text-[34px]">{match.court.padStart(2, "0")}</strong></div>
    <div className="flex items-center gap-2">{match.category && <Badge className={cn("bg-[#f0f3fa] px-1.5 py-0.75 text-[9px] text-[#5a6d97] lg:bg-transparent lg:text-[8px]", badgeText)}>{match.category}</Badge>}</div>
  </div>;
  const cardClass = "min-w-0 overflow-hidden rounded-[10px] border border-[#e0e5ee] bg-white shadow-[0_2px_3px_#192c5010] lg:relative lg:rounded-[9px] lg:pl-23";

  if (!match.available) {
    // Same height as a live card's score table and footer (178px; 149px from lg; 122px in fullscreen), so grid rows stay even.
    return <article className={cn(cardClass, "border-dashed bg-[#fafbfe] shadow-none")} aria-label={`Lapangan ${match.court}, menunggu pertandingan`}>
      {header}
      <div className={cn("flex min-h-44.5 flex-col items-center justify-center gap-2.5 text-center lg:min-h-37.25 lg:flex-row lg:gap-3 full:min-h-30.5", cardInset)}>
        <span className="grid size-10 place-items-center rounded-full bg-[#edf2fc] text-[#7183a9]" aria-hidden="true"><Hourglass size={18} className="animate-hourglass motion-reduce:animate-none" /></span>
        <p className="text-[12px] font-semibold text-[#8a93a4] lg:text-[13px]">Menunggu pertandingan</p>
      </div>
    </article>;
  }

  const activeGame = currentGame(match);
  const progress = matchProgress(match);
  const points = pointStatus(match);
  const message = footerMessage(match.message);
  return <article className={cardClass} aria-label={`Lapangan ${match.court}${match.category ? `, ${categoryLabel(match.category)}` : ""}`}>
    {header}
    <div className={cn(cardInset, "lg:px-3 lg:py-1.5 full:py-1")} role="table" aria-label={`Skor lapangan ${match.court}`}>
      <div className={cn(scoreColumns, "h-7.25 items-center text-[8px] font-semibold tracking-[0.6px] text-[#929aab] lg:h-4.75 lg:text-[9px] full:h-4")} role="row"><span role="columnheader" className="lg:text-[8px]">{match.group || "PEMAIN"}</span>{[1, 2, 3].map((game) => <span key={game} role="columnheader" className={cn("text-center", game - 1 === activeGame && "text-[#2b4d9b]")}>G{game}</span>)}</div>
      {match.sides.map((side, index) => {
        const flag = countryFlag(side.country);
        const winner = progress.winner === index;
        const ongoing = progress.winner === null && progress.started;
        const showIndicator = winner || (progress.winner === null && side.serving);
        const indicatorLabel = winner ? "Pemenang pertandingan" : "Pemegang servis";
        const point = points[index];
        // Below lg the badge sits under the names, so it does not squeeze them; from lg it sits beside the indicator.
        const pointTag = (className: string) => point && <Badge className={cn("rounded px-1.5 py-0.5 font-sans text-[8px] tracking-[0.4px] lg:px-2 lg:text-[11px]", badgeText, pointBadge[point][1], className)}>{pointBadge[point][0]}</Badge>;
        const flagClass = "block aspect-[4/3] h-5.25 w-7 rounded-none border border-gray-200 object-fill lg:h-6 lg:w-8";
        return <div className={cn(scoreColumns, "min-h-13.75 items-stretch pb-1.75 lg:min-h-11.75 lg:pb-1 full:min-h-9.5")} role="row" key={index}>
          <div className="flex min-w-0 items-center gap-1.75 pr-0.5 sm:gap-1.25 lg:gap-2.5" role="cell">
            {/* Flag only; a country without a flag image shows its code inside the placeholder. */}
            <div className="flex shrink-0 items-center">{flag.flag ? <Image src={withBasePath(flag.flag)} alt={flag.name} width={32} height={24} className={flagClass} unoptimized /> : <span className={cn(flagClass, "grid place-items-center bg-[#e9edf3] text-[8px] leading-none font-[650] text-[#8993a7] lg:text-[9px]")} aria-hidden={!side.country}>{side.country}</span>}</div>
            {/* From 1024px (lg) a doubles pair shares one line: "NAME / PARTNER". */}
            <div className="min-w-0 font-display text-[14px] leading-[1.35] font-semibold tracking-[0.25px] wrap-anywhere text-[#293449] sm:text-[13px] lg:flex lg:text-[22px] lg:tracking-[0.3px]">{side.players.length ? side.players.map((p, i) => <span key={i} className={cn("block", i > 0 && "lg:before:mx-2 lg:before:text-[#b6becd] lg:before:content-['/']")}>{p}</span>) : <span className="block text-[10px] font-normal text-[#a1a9b7]">Menunggu pemain</span>}{pointTag("mt-1 lg:hidden")}</div>
            {(point || showIndicator) && <div className="ml-auto flex shrink-0 items-center gap-2">
              {pointTag("hidden lg:inline-flex")}
              {showIndicator && <span className={cn("inline-flex size-4 shrink-0 items-center justify-center", ongoing && animateIndicator && "animate-pulse motion-reduce:animate-none")} role="img" aria-label={indicatorLabel} title={indicatorLabel}><span className={cn("size-2.5 rounded-full", winner || ongoing ? "bg-emerald-500" : "bg-slate-400")} /></span>}
              {/* Keep the indicator's slot so badges line up across both rows. */}
              {!showIndicator && <span className="size-4 shrink-0" aria-hidden="true" />}
            </div>}
          </div>
          {side.scores.map((score, game) => <div key={game} role="cell" aria-label={`Pertandingan ${game + 1}: ${score !== null ? score : "belum ada skor"}`} className={cn("relative grid place-items-center overflow-hidden rounded-[5px] bg-[#f4f6fa] font-display text-[24px] leading-none font-bold text-[#a6aebc] tabular-nums sm:text-[26px] lg:text-[34px] full:text-[30px]", game === activeGame && "bg-[#eaf0fc] text-[#23428d] shadow-[inset_0_-2px_0_#dae4fc]")}><RollScore value={score !== null ? String(score) : "—"} /></div>)}
        </div>;
      })}
    </div>
    <div className={cn("mt-1 flex min-h-8.75 items-center justify-between gap-2 border-t border-[#f0f2f6] py-1.75 text-[9px] text-[#8a93a4] lg:mt-0 lg:min-h-6 lg:px-4.5 full:min-h-5 lg:py-0.75 lg:text-[8px]", cardInset)}><span>{categoryLabel(match.category) || "Pertandingan"}</span>{message ? <Badge className={cn("bg-[#fff4df] px-1.5 py-0.5 text-[8px] text-[#af7628] lg:text-[9px]", badgeText)}>{message}</Badge> : <span className="text-[9px] text-[#7789aa] lg:text-[10px]">{`Pertandingan ${activeGame + 1}`}</span>}</div>
  </article>;
}
