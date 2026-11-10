import { CalendarClock } from "lucide-react";

// Shown instead of the court cards when no court has a match (see isBoardIdle). The feed has no
// status field, so this is derived purely from every court being cleared.
export function IdleBoard({ courts }: { courts: number }) {
  return <div className="state-panel" role="status"><div className="state-icon"><CalendarClock size={27} /></div><h3>Tidak ada pertandingan berlangsung</h3><p>{courts > 0 ? `${courts} lapangan siap. ` : ""}Skor akan muncul otomatis saat pertandingan dimulai.</p></div>;
}
