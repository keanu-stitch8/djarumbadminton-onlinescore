import Image from "next/image";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { categoryLabel, countryFlag, currentGame, matchProgress } from "../lib/scoreboard";
import type { CourtMatch } from "../types/scores";

export function MatchCard({ match, animateIndicator = true }: { match: CourtMatch; animateIndicator?: boolean }) {
  const activeGame = currentGame(match);
  const progress = matchProgress(match);
  return <article className={cn("match-card", !match.available && "match-card-empty", "display-card")} aria-label={`Lapangan ${match.court}${match.category ? `, ${categoryLabel(match.category)}` : ""}`}>
    <div className="match-card-header"><div className="court-label"><MapPin size={13} aria-hidden="true" /><span>LAPANGAN</span><strong>{match.court.padStart(2, "0")}</strong></div><div className="flex items-center gap-2">{match.category && <Badge className="category-badge">{match.category}</Badge>}</div></div>
    <div className="score-table" role="table" aria-label={`Skor lapangan ${match.court}`}>
      <div className="score-table-heading" role="row"><span role="columnheader">{match.group || (match.available ? "PEMAIN" : "MENUNGGU PERTANDINGAN")}</span>{[1, 2, 3].map((game) => <span key={game} role="columnheader" className={cn("game-heading", game - 1 === activeGame && match.available && "active-game-heading")}>G{game}</span>)}</div>
      {match.sides.map((side, index) => {
        const flag = countryFlag(side.country);
        const winner = progress.winner === index;
        const ongoing = progress.winner === null && progress.started;
        const showIndicator = match.available && (winner || (progress.winner === null && side.serving));
        const indicatorLabel = winner ? "Pemenang pertandingan" : "Pemegang servis";
        return <div className="player-row" role="row" key={index}>
          <div className="player-cell" role="cell"><div className="player-country">{flag.flag ? <Image src={flag.flag} alt={flag.name} width={32} height={24} className="country-flag border border-gray-200" unoptimized /> : <span className="country-flag country-flag-placeholder border border-gray-200" aria-hidden="true" />}<span>{side.country || "—"}</span></div><div className="player-name">{side.players.length ? side.players.map((p, i) => <span key={i}>{p}</span>) : <span className="waiting-player">{match.available ? "Menunggu pemain" : "Belum ada pertandingan"}</span>}</div>{showIndicator && <span className={cn("ml-auto inline-flex size-4 shrink-0 items-center justify-center", ongoing && animateIndicator && "animate-pulse motion-reduce:animate-none")} role="img" aria-label={indicatorLabel} title={indicatorLabel}><span className={cn("size-2.5 rounded-full", winner || ongoing ? "bg-emerald-500" : "bg-slate-400")} /></span>}</div>
          {side.scores.map((score, game) => <div key={game} role="cell" aria-label={`Gim ${game + 1}: ${match.available && score !== null ? score : "belum ada skor"}`} className={cn("score-cell", game === activeGame && match.available && "score-current")}>{match.available && score !== null ? score : "—"}</div>)}
        </div>;
      })}
    </div>
    <div className="match-card-footer"><span>{match.available ? categoryLabel(match.category) || "Pertandingan" : "Lapangan tersedia"}</span>{match.message ? <Badge className="match-message">{match.message}</Badge> : <span className="game-label">{match.available ? `Gim ${activeGame + 1}` : "Menunggu"}</span>}</div>
  </article>;
}
