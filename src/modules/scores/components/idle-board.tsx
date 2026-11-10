import { CalendarClock } from "lucide-react";
import { StatePanel } from "@/components/state-panel";

// Shown instead of the court cards when no court has a match (see isBoardIdle). The feed has no
// status field, so this is derived purely from every court being cleared.
export function IdleBoard({ courts }: { courts: number }) {
  return <StatePanel role="status" icon={<CalendarClock size={27} />} title="Tidak ada pertandingan berlangsung">{courts > 0 ? `${courts} lapangan siap. ` : ""}Skor akan muncul otomatis saat pertandingan dimulai.</StatePanel>;
}
